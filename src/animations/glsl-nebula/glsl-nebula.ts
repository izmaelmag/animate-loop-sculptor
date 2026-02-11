import { AnimationSettings, FrameContext, WebGLAnimationFunction } from "@/types/animations";
import {
  createFullscreenQuad,
  createProgram,
  destroyFullscreenQuad,
  destroyProgram,
  FullscreenQuad,
} from "@/utils/webgl";

const WIDTH = 1080;
const HEIGHT = 1920;
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

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amp * noise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
  float t = u_time * 6.28318530718;

  vec2 drift = vec2(cos(t), sin(t)) * 0.35;
  vec2 p = uv * 2.2 + drift;
  float n1 = fbm(p + vec2(0.0, t * 0.2));
  float n2 = fbm(p * 1.7 - vec2(t * 0.15, 0.0));
  float cloud = smoothstep(0.28, 0.92, 0.55 * n1 + 0.45 * n2);

  float glow = exp(-3.2 * length(uv));
  vec3 base = vec3(0.03, 0.04, 0.10);
  vec3 pink = vec3(0.95, 0.35, 0.75);
  vec3 cyan = vec3(0.25, 0.85, 1.00);

  float cycle = 0.5 + 0.5 * sin(t + cloud * 6.0);
  vec3 nebula = mix(pink, cyan, cycle);
  vec3 color = base + nebula * cloud * (0.6 + 0.4 * glow);

  float stars = step(0.996, hash(floor((uv + 1.0) * 450.0 + vec2(t * 4.0))));
  color += vec3(stars) * 0.9 * glow;

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
  ctx: FrameContext
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
  id: "glsl-nebula",
  name: "[WebGL] GLSL Nebula",
  renderer: "webgl",
  fps: FPS,
  totalFrames: TOTAL_FRAMES,
  width: WIDTH,
  height: HEIGHT,
  setup,
  draw,
  cleanup,
};
