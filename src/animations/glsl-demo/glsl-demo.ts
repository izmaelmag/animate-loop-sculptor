import { AnimationSettings, FrameContext, WebGLAnimationFunction } from "@/types/animations";

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
let vertexBuffer: WebGLBuffer | null = null;
let vao: WebGLVertexArrayObject | null = null;
let timeLocation: WebGLUniformLocation | null = null;
let resolutionLocation: WebGLUniformLocation | null = null;

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Failed to create shader.");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${info || "Unknown shader error"}`);
  }

  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string
): WebGLProgram {
  const vs = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  const nextProgram = gl.createProgram();
  if (!nextProgram) {
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    throw new Error("Failed to create WebGL program.");
  }

  gl.attachShader(nextProgram, vs);
  gl.attachShader(nextProgram, fs);
  gl.linkProgram(nextProgram);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  if (!gl.getProgramParameter(nextProgram, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(nextProgram);
    gl.deleteProgram(nextProgram);
    throw new Error(`Program link failed: ${info || "Unknown link error"}`);
  }

  return nextProgram;
}

const setup = (gl: WebGL2RenderingContext, canvas: HTMLCanvasElement): void => {
  program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  gl.useProgram(program);

  const positions = new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    -1, 1,
    1, -1,
    1, 1,
  ]);

  vertexBuffer = gl.createBuffer();
  vao = gl.createVertexArray();
  if (!vertexBuffer || !vao) {
    throw new Error("Failed to create WebGL buffers.");
  }

  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  timeLocation = gl.getUniformLocation(program, "u_time");
  resolutionLocation = gl.getUniformLocation(program, "u_resolution");

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.bindVertexArray(null);
};

const draw: WebGLAnimationFunction = (
  gl: WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
  ctx: FrameContext
): void => {
  if (!program || !vao) {
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

  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.bindVertexArray(null);
};

const cleanup = (): void => {
  program = null;
  vertexBuffer = null;
  vao = null;
  timeLocation = null;
  resolutionLocation = null;
};

export const settings: AnimationSettings = {
  id: "glsl-demo",
  name: "GLSL Demo",
  renderer: "webgl",
  fps: FPS,
  totalFrames: TOTAL_FRAMES,
  width: WIDTH,
  height: HEIGHT,
  setup,
  draw,
  cleanup,
};
