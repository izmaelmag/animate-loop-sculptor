import {
  AnimationSettings,
  FrameContext,
  WebGLAnimationFunction,
} from "@/types/animations";
import {
  createFullscreenQuad,
  createProgram,
  destroyFullscreenQuad,
  destroyProgram,
  FullscreenQuad,
} from "../../utils/webgl";

const WIDTH = 2160;
const HEIGHT = 3840;
const FPS = 60;
const TOTAL_FRAMES = FPS * 8;

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

out vec4 outColor;

vec3 palette(float t) {
  vec3 a = vec3(0.45, 0.35, 0.60);
  vec3 b = vec3(0.45, 0.40, 0.30);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.0, 0.33, 0.67);
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
  float loopT = u_time * 6.28318530718;

  float flowA = sin(loopT + uv.x * 3.0) * 0.25;
  float flowB = cos(loopT * 2.0 + uv.y * 5.0) * 0.18;
  float radial = length(uv + vec2(flowA, flowB));

  float waves = sin(12.0 * radial - loopT * 3.0);
  float ribbons = cos((uv.x - uv.y) * 10.0 + loopT * 2.0);
  float mixSignal = 0.5 + 0.5 * sin(loopT + radial * 8.0 + ribbons * 0.8);

  float shade = 0.45 + 0.35 * waves + 0.20 * ribbons;
  vec3 colorA = palette(shade + mixSignal * 0.25);
  vec3 colorB = palette(shade * 0.7 + 0.2 - mixSignal * 0.2);
  vec3 color = mix(colorA, colorB, mixSignal);

  float vignette = smoothstep(1.2, 0.2, radial);
  color *= 0.4 + 0.6 * vignette;

  outColor = vec4(color, 1.0);
}
`;

let program: WebGLProgram | null = null;
let quad: FullscreenQuad | null = null;
let timeLocation: WebGLUniformLocation | null = null;
let resolutionLocation: WebGLUniformLocation | null = null;
let glRef: WebGL2RenderingContext | null = null;

const setup = (gl: WebGL2RenderingContext, canvas: HTMLCanvasElement): void => {
  program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  gl.useProgram(program);
  quad = createFullscreenQuad(gl, program);

  timeLocation = gl.getUniformLocation(program, "u_time");
  resolutionLocation = gl.getUniformLocation(program, "u_resolution");
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

  if (resolutionLocation) {
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
  }
  if (timeLocation) {
    gl.uniform1f(timeLocation, ctx.normalizedTime);
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
  glRef = null;
};

export const settings: AnimationSettings = {
  id: "glsl-demo",
  name: "[WebGL] GLSL Flow",
  renderer: "webgl",
  fps: FPS,
  totalFrames: TOTAL_FRAMES,
  width: WIDTH,
  height: HEIGHT,
  setup,
  draw,
  cleanup,
};
