import p5 from "p5";
import {
  AnimationSettings,
  P5AnimationFunction,
  FrameContext,
} from "@/types/animations";

/**
 * Manages a p5.js instance lifecycle: creation, frame drawing, and cleanup.
 */
export class P5Renderer {
  private p5Instance: p5 | null = null;
  private drawFn: P5AnimationFunction | null = null;
  private frameContext: FrameContext = {
    normalizedTime: 0,
    currentFrame: 0,
    totalFrames: 1,
  };

  initialize(container: HTMLElement, settings: AnimationSettings) {
    this.destroy();

    const drawFn = settings.draw as P5AnimationFunction;
    const setupFn = settings.setup as ((p: p5) => void) | undefined;
    this.drawFn = drawFn;

    const width = settings.width || 1080;
    const height = settings.height || 1920;

    const sketch = (p: p5) => {
      p.setup = () => {
        p.createCanvas(width, height, p.WEBGL);
        p.pixelDensity(1);
        p.frameRate(settings.fps);

        if (setupFn) {
          setupFn(p);
        }

        p.noLoop();
      };

      p.draw = () => {
        if (this.drawFn) {
          this.drawFn(p, this.frameContext);
        }
      };
    };

    this.p5Instance = new p5(sketch, container);
  }

  renderFrame(ctx: FrameContext) {
    this.frameContext = ctx;
    if (this.p5Instance) {
      this.p5Instance.redraw();
    }
  }

  destroy() {
    if (this.p5Instance) {
      this.p5Instance.remove();
      this.p5Instance = null;
    }
    this.drawFn = null;
  }
}
