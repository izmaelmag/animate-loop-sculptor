import { AnimationSettings, FrameContext, WebGLAnimationFunction } from "@/types/animations";
import {
  createFullscreenQuad,
  createProgram,
  destroyFullscreenQuad,
  destroyProgram,
  FullscreenQuad,
} from "../../utils/webgl";

const FPS = {{fpsLiteral}};
const WIDTH = {{widthLiteral}};
const HEIGHT = {{heightLiteral}};
const DURATION_SECONDS = {{durationSecondsLiteral}};

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

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
  float t = u_time * 6.28318530718;
  float wave = 0.5 + 0.5 * sin(uv.x * 8.0 + t);
  vec3 colorA = vec3(0.08, 0.10, 0.18);
  vec3 colorB = vec3(0.20, 0.55, 0.95);
  vec3 color = mix(colorA, colorB, wave);
  outColor = vec4(color, 1.0);
}
`;

let program: WebGLProgram | null = null;
let quad: FullscreenQuad | null = null;
let resolutionLocation: WebGLUniformLocation | null = null;
let timeLocation: WebGLUniformLocation | null = null;
let glRef: WebGL2RenderingContext | null = null;

const setup = (gl: WebGL2RenderingContext, canvas: HTMLCanvasElement): void => {
  program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  gl.useProgram(program);
  quad = createFullscreenQuad(gl, program);

  resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  timeLocation = gl.getUniformLocation(program, "u_time");
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
  resolutionLocation = null;
  timeLocation = null;
  glRef = null;
};

export const settings: AnimationSettings = {
  id: {{idLiteral}},
  name: {{displayNameLiteral}},
  renderer: "webgl",
  fps: FPS,
  totalFrames: FPS * DURATION_SECONDS,
  width: WIDTH,
  height: HEIGHT,
  setup,
  draw,
  cleanup,
};
