import {
  AnimationSettings,
  FrameContext,
  WebGLAnimationFunction,
} from "../../types/animations";

/**
 * Manages a WebGL2 rendering context lifecycle.
 */
export class WebGLRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGL2RenderingContext | null = null;
  private drawFn: WebGLAnimationFunction | null = null;
  private cleanupFn: (() => void) | null = null;

  initialize(container: HTMLElement, settings: AnimationSettings) {
    this.destroy();

    const width = settings.width || 1080;
    const height = settings.height || 1920;
    const setupFn = settings.setup as
      | ((gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) => void)
      | undefined;

    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    container.appendChild(this.canvas);

    const gl = this.canvas.getContext("webgl2", {
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });

    if (!gl) {
      throw new Error("WebGL2 is not supported in this environment.");
    }

    this.gl = gl;
    this.drawFn = settings.draw as WebGLAnimationFunction;
    this.cleanupFn = settings.cleanup || null;

    if (setupFn) {
      setupFn(gl, this.canvas);
    }
  }

  renderFrame(ctx: FrameContext) {
    if (this.drawFn && this.gl && this.canvas) {
      this.drawFn(this.gl, this.canvas, ctx);
    }
  }

  destroy() {
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = null;
    }

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.canvas = null;
    this.gl = null;
    this.drawFn = null;
  }
}
