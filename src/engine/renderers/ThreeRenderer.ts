import {
  AnimationSettings,
  ThreeAnimationFunction,
  FrameContext,
} from "@/types/animations";

/**
 * Manages a Three.js rendering context.
 * The animation function receives the container element and is responsible
 * for setting up its own Three.js scene, camera, and renderer.
 *
 * This keeps the engine decoupled from Three.js as a dependency —
 * only animation templates that use Three.js need to import it.
 */
export class ThreeRenderer {
  private container: HTMLElement | null = null;
  private drawFn: ThreeAnimationFunction | null = null;
  private cleanupFn: (() => void) | null = null;

  initialize(container: HTMLElement, settings: AnimationSettings) {
    this.destroy();

    this.container = container;
    this.drawFn = settings.draw as ThreeAnimationFunction;
    this.cleanupFn = settings.cleanup || null;

    const setupFn = settings.setup as
      | ((container: HTMLElement) => void)
      | undefined;

    if (setupFn) {
      setupFn(container);
    }
  }

  renderFrame(ctx: FrameContext) {
    if (this.drawFn && this.container) {
      this.drawFn(this.container, ctx);
    }
  }

  destroy() {
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = null;
    }
    this.container = null;
    this.drawFn = null;
  }
}
