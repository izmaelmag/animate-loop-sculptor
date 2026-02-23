import {
  AnimationSettings,
  AnimationParamsPaneContext,
  FrameContext,
  WebGLAnimationFunction,
} from "../../types/animations";
import {
  createFullscreenQuad,
  createProgram,
  destroyFullscreenQuad,
  destroyProgram,
  FullscreenQuad,
} from "../../utils/webgl";
import {
  grainOverlayShaderChunk,
} from "../../utils/glsl/postFx";

const WIDTH = 2160;
const HEIGHT = 3840;
const FPS = 60;
const TOTAL_FRAMES = FPS * 8;

interface GLSLFlowParams extends Record<string, unknown> {
  speed: number;
  grainStrength: number;
  grainScale: number;
  vignetteStrength: number;
  paletteShift: number;
}

const defaultParams: GLSLFlowParams = {
  speed: 1,
  grainStrength: 0.018,
  grainScale: 1,
  vignetteStrength: 1,
  paletteShift: 0,
};

const asNumber = (value: unknown, fallback: number): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

const resolveParams = (raw: Record<string, unknown>): GLSLFlowParams => {
  return {
    speed: asNumber(raw.speed, defaultParams.speed),
    grainStrength: asNumber(raw.grainStrength, defaultParams.grainStrength),
    grainScale: asNumber(raw.grainScale, defaultParams.grainScale),
    vignetteStrength: asNumber(raw.vignetteStrength, defaultParams.vignetteStrength),
    paletteShift: asNumber(raw.paletteShift, defaultParams.paletteShift),
  };
};

const vertexShaderSource = `#version 300 es
in vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform float u_grainStrength;
uniform float u_grainScale;
uniform float u_vignetteStrength;
uniform float u_paletteShift;

out vec4 outColor;

${grainOverlayShaderChunk}

vec3 palette(float t) {
  vec3 a = vec3(0.45, 0.35, 0.60);
  vec3 b = vec3(0.45, 0.40, 0.30);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.0, 0.33, 0.67);
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
  float loopT = u_time * 6.28318530718 * max(0.001, u_speed);

  float flowA = sin(loopT + uv.x * 3.0) * 0.25;
  float flowB = cos(loopT * 2.0 + uv.y * 5.0) * 0.18;
  float radial = length(uv + vec2(flowA, flowB));

  float waves = sin(12.0 * radial - loopT * 3.0);
  float ribbons = cos((uv.x - uv.y) * 10.0 + loopT * 2.0);
  float mixSignal = 0.5 + 0.5 * sin(loopT + radial * 8.0 + ribbons * 0.8);

  float shade = 0.45 + 0.35 * waves + 0.20 * ribbons + u_paletteShift;
  vec3 colorA = palette(shade + mixSignal * 0.25);
  vec3 colorB = palette(shade * 0.7 + 0.2 - mixSignal * 0.2);
  vec3 color = mix(colorA, colorB, mixSignal);

  float vignette = smoothstep(1.2, 0.2, radial);
  float vignetteMix = mix(1.0, vignette, clamp(u_vignetteStrength, 0.0, 1.0));
  color *= 0.4 + 0.6 * vignetteMix;
  color = applyGrainOverlay(
    color,
    gl_FragCoord.xy,
    u_resolution,
    u_time,
    u_grainStrength,
    u_grainScale
  );

  outColor = vec4(color, 1.0);
}
`;

let program: WebGLProgram | null = null;
let quad: FullscreenQuad | null = null;
let timeLocation: WebGLUniformLocation | null = null;
let resolutionLocation: WebGLUniformLocation | null = null;
let speedLocation: WebGLUniformLocation | null = null;
let grainStrengthLocation: WebGLUniformLocation | null = null;
let grainScaleLocation: WebGLUniformLocation | null = null;
let vignetteStrengthLocation: WebGLUniformLocation | null = null;
let paletteShiftLocation: WebGLUniformLocation | null = null;
let glRef: WebGL2RenderingContext | null = null;

const setup = (gl: WebGL2RenderingContext, canvas: HTMLCanvasElement): void => {
  program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  gl.useProgram(program);
  quad = createFullscreenQuad(gl, program);

  timeLocation = gl.getUniformLocation(program, "u_time");
  resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  speedLocation = gl.getUniformLocation(program, "u_speed");
  grainStrengthLocation = gl.getUniformLocation(program, "u_grainStrength");
  grainScaleLocation = gl.getUniformLocation(program, "u_grainScale");
  vignetteStrengthLocation = gl.getUniformLocation(program, "u_vignetteStrength");
  paletteShiftLocation = gl.getUniformLocation(program, "u_paletteShift");
  glRef = gl;
  gl.viewport(0, 0, canvas.width, canvas.height);
};

const draw: WebGLAnimationFunction = (
  gl: WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
  ctx: FrameContext,
): void => {
  if (!program || !quad) {
    return;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.useProgram(program);
  const params = resolveParams(ctx.params);

  if (resolutionLocation) {
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
  }
  if (timeLocation) {
    gl.uniform1f(timeLocation, ctx.normalizedTime);
  }
  if (speedLocation) {
    gl.uniform1f(speedLocation, params.speed);
  }
  if (grainStrengthLocation) {
    gl.uniform1f(grainStrengthLocation, params.grainStrength);
  }
  if (grainScaleLocation) {
    gl.uniform1f(grainScaleLocation, params.grainScale);
  }
  if (vignetteStrengthLocation) {
    gl.uniform1f(vignetteStrengthLocation, params.vignetteStrength);
  }
  if (paletteShiftLocation) {
    gl.uniform1f(paletteShiftLocation, params.paletteShift);
  }

  gl.bindVertexArray(quad.vao);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.bindVertexArray(null);
};

const cleanup = (): void => {
  if (glRef) {
    destroyFullscreenQuad(glRef, quad);
    destroyProgram(glRef, program);
  }

  program = null;
  quad = null;
  timeLocation = null;
  resolutionLocation = null;
  speedLocation = null;
  grainStrengthLocation = null;
  grainScaleLocation = null;
  vignetteStrengthLocation = null;
  paletteShiftLocation = null;
  glRef = null;
};

const createParamsPane = ({
  pane,
  params,
  patchParams,
  resetParams,
}: AnimationParamsPaneContext): void => {
  const model: GLSLFlowParams = resolveParams(params);

  pane
    .addBinding(model, "speed", { min: 0.2, max: 3, step: 0.01, label: "Speed" })
    .on("change", (ev) => patchParams({ speed: ev.value }));

  pane
    .addBinding(model, "grainStrength", {
      min: 0,
      max: 0.08,
      step: 0.001,
      label: "Grain",
    })
    .on("change", (ev) => patchParams({ grainStrength: ev.value }));

  pane
    .addBinding(model, "grainScale", {
      min: 0.25,
      max: 4,
      step: 0.01,
      label: "Grain Scale",
    })
    .on("change", (ev) => patchParams({ grainScale: ev.value }));

  pane
    .addBinding(model, "vignetteStrength", {
      min: 0,
      max: 1,
      step: 0.01,
      label: "Vignette",
    })
    .on("change", (ev) => patchParams({ vignetteStrength: ev.value }));

  pane
    .addBinding(model, "paletteShift", {
      min: -1,
      max: 1,
      step: 0.001,
      label: "Palette",
    })
    .on("change", (ev) => patchParams({ paletteShift: ev.value }));

  pane.addButton({ title: "Reset Params" }).on("click", () => {
    resetParams();
    Object.assign(model, defaultParams);
    pane.refresh();
  });
};

export const settings: AnimationSettings = {
  id: "glsl-demo",
  name: "🧪 GLSL Flow",
  renderer: "webgl",
  fps: FPS,
  totalFrames: TOTAL_FRAMES,
  width: WIDTH,
  height: HEIGHT,
  defaultParams,
  createParamsPane,
  setup,
  draw,
  cleanup,
};
