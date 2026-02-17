import p5 from "p5";
import type { ComponentType } from "react";

/**
 * Renderer backends supported by the animation engine.
 * Each animation declares which renderer it needs.
 */
export type RendererType = "p5" | "canvas2d" | "three" | "webgl" | "r3f";

/**
 * Frame context passed to every animation function on each frame.
 */
export interface FrameContext {
  normalizedTime: number;
  currentFrame: number;
  totalFrames: number;
}

/**
 * p5.js animation function signature.
 * Receives the p5 instance and frame context.
 */
export type P5AnimationFunction = (
  p: p5,
  ctx: FrameContext,
) => void;

/**
 * Canvas 2D animation function signature.
 * Receives the 2D rendering context and frame context.
 */
export type Canvas2DAnimationFunction = (
  ctx2d: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  ctx: FrameContext,
) => void;

/**
 * Three.js animation function signature.
 * Receives the container element and frame context.
 * The animation is responsible for managing its own Three.js scene/renderer.
 */
export type ThreeAnimationFunction = (
  container: HTMLElement,
  ctx: FrameContext,
) => void;

/**
 * WebGL animation function signature.
 * Receives a WebGL2 context, canvas element, and frame context.
 */
export type WebGLAnimationFunction = (
  gl: WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
  ctx: FrameContext,
) => void;

/**
 * Props passed into a react-three-fiber scene component.
 */
export interface R3FSceneProps {
  ctx: FrameContext;
}

/**
 * react-three-fiber animation function signature.
 * A React component rendered inside an r3f <Canvas />.
 */
export type R3FAnimationFunction = ComponentType<R3FSceneProps>;

/**
 * Union of all animation function types.
 */
export type AnimationFunction =
  | P5AnimationFunction
  | Canvas2DAnimationFunction
  | ThreeAnimationFunction
  | WebGLAnimationFunction
  | R3FAnimationFunction;

/**
 * Setup function called once when the animation initializes.
 * Signature depends on renderer type.
 */
export type AnimationSetupFunction =
  | ((p: p5) => void)
  | ((ctx2d: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void)
  | ((container: HTMLElement) => void)
  | ((gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) => void);

/**
 * Cleanup function called when the animation is destroyed.
 */
export type AnimationCleanupFunction = () => void;

/**
 * Animation template definition.
 * Declares metadata, renderer type, and lifecycle functions.
 */
export interface AnimationSettings {
  id: string;
  name: string;
  renderer: RendererType;
  fps: number;
  totalFrames: number;
  width?: number;
  height?: number;
  draw: AnimationFunction;
  setup?: AnimationSetupFunction;
  cleanup?: AnimationCleanupFunction;
}

// Legacy type alias for backward compatibility during migration
export type LegacyAnimationFunction = (
  p: p5,
  normalizedTime?: number,
  currentFrameNum?: number,
  totalFrames?: number,
) => void;
