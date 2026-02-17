import { RendererType, FrameContext, AnimationSettings } from "@/types/animations";
import { P5Renderer } from "./renderers/P5Renderer";
import { Canvas2DRenderer } from "./renderers/Canvas2DRenderer";
import { ThreeRenderer } from "./renderers/ThreeRenderer";
import { WebGLRenderer } from "./renderers/WebGLRenderer";
import { R3FRenderer } from "./renderers/R3FRenderer";

/**
 * Common interface for all renderer backends.
 */
export interface Renderer {
  initialize(container: HTMLElement, settings: AnimationSettings): void;
  renderFrame(ctx: FrameContext): void;
  destroy(): void;
}

/**
 * Creates the appropriate renderer based on the animation's declared renderer type.
 */
export function createRenderer(type: RendererType): Renderer {
  switch (type) {
    case "p5":
      return new P5Renderer();
    case "canvas2d":
      return new Canvas2DRenderer();
    case "three":
      return new ThreeRenderer();
    case "webgl":
      return new WebGLRenderer();
    case "r3f":
      return new R3FRenderer();
    default:
      throw new Error(`Unknown renderer type: ${type}`);
  }
}
