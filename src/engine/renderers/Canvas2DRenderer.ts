import {
  AnimationSettings,
  Canvas2DAnimationFunction,
  FrameContext,
} from "@/types/animations";

/**
 * Manages a vanilla Canvas 2D rendering context.
 */
export class Canvas2DRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx2d: CanvasRenderingContext2D | null = null;
  private drawFn: Canvas2DAnimationFunction | null = null;

  initialize(container: HTMLElement, settings: AnimationSettings) {
    this.destroy();

    const width = settings.width || 1080;
    const height = settings.height || 1920;

    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    container.appendChild(this.canvas);

    this.ctx2d = this.canvas.getContext("2d");
    this.drawFn = settings.draw as Canvas2DAnimationFunction;

    const setupFn = settings.setup as
      | ((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void)
      | undefined;

    if (setupFn && this.ctx2d) {
      setupFn(this.ctx2d, this.canvas);
    }
  }

  renderFrame(ctx: FrameContext) {
    if (this.drawFn && this.ctx2d && this.canvas) {
      this.drawFn(this.ctx2d, this.canvas, ctx);
    }
  }

  destroy() {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx2d = null;
    this.drawFn = null;
  }
}
