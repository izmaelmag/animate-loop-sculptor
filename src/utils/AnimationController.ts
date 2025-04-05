import p5 from "p5";
import {
  animations,
  animationSettings,
  defaultAnimation,
  AnimationName,
} from "@/animations";
import { AnimationFunction } from "@/types/animations";

export class AnimationController {
  private p5Instance: p5 | null = null;
  private sketchFunction: AnimationFunction | null = null;
  private animationFrameRef: number | null = null;
  private lastUpdateTimeRef: number = 0;
  private currentAnimationId: AnimationName = defaultAnimation.id;
  private containerElement: HTMLElement | null = null;

  // Animation settings - just fps and totalFrames
  public fps: number;
  public totalFrames: number;
  public width: number;
  public height: number;

  // Animation state
  private _currentFrame: number = 0;
  private _isPlaying: boolean = false;
  private _sketchCode: string = "";

  // Callbacks
  private onFrameChangedCallbacks: ((
    frame: number,
    normalizedTime: number
  ) => void)[] = [];
  private onPlayStateChangedCallbacks: ((isPlaying: boolean) => void)[] = [];

  constructor(fps: number, totalFrames: number, width: number, height: number) {
    this.fps = fps;
    this.totalFrames = totalFrames;
    this.width = width;
    this.height = height;
  }

  // Getter for normalized time (0-1)
  get normalizedTime(): number {
    const isManyFrames = this.totalFrames > 1;

    if (!isManyFrames) {
      return 0;
    }

    return this._currentFrame / (this.totalFrames - 1);
  }

  // FPS setter
  setFps(fps: number): void {
    if (fps > 0 && this.fps !== fps) {
      this.fps = fps;
      console.log(`FPS updated to ${fps}`);
    }
  }

  // totalFrames setter
  setTotalFrames(totalFrames: number): void {
    if (totalFrames > 0 && this.totalFrames !== totalFrames) {
      this.totalFrames = totalFrames;
      // Ensure current frame is within bounds after totalFrames change
      if (this._currentFrame >= this.totalFrames) {
        this._currentFrame = this.totalFrames - 1;
        this.notifyFrameChanged();
      }
      console.log(`Total frames updated to ${totalFrames}`);
    }
  }

  // Frame getter and setter
  get currentFrame(): number {
    return this._currentFrame;
  }

  set currentFrame(frame: number) {
    const newFrame = Math.max(0, Math.min(this.totalFrames - 1, frame));
    if (this._currentFrame !== newFrame) {
      this._currentFrame = newFrame;
      this.notifyFrameChanged();
    }
  }

  // Playback control
  get isPlaying(): boolean {
    return this._isPlaying;
  }

  set isPlaying(value: boolean) {
    if (this._isPlaying !== value) {
      this._isPlaying = value;
      this.notifyPlayStateChanged();

      if (value) {
        this.startAnimationLoop();
      } else {
        this.stopAnimationLoop();
      }
    }
  }

  // Sketch code getter and setter
  get sketchCode(): string {
    return this._sketchCode;
  }

  set sketchCode(code: string) {
    if (this._sketchCode !== code) {
      this._sketchCode = code;
      this.compileSketchFunction();
      this.redraw();
    }
  }

  // Add direct animation function setter
  setAnimationFunction(animationFn: AnimationFunction): void {
    this.sketchFunction = animationFn;
    this.redraw();
  }

  // Initialize P5 instance with a container element
  initializeP5(container: HTMLElement): void {
    if (this.p5Instance) {
      this.p5Instance.remove();
    }

    this.containerElement = container;

    const sketch = (p: p5) => {
      p.setup = () => {
        // Get animation settings for current animation
        const currentSettings =
          animationSettings[
            this.currentAnimationId as keyof typeof animationSettings
          ] || defaultAnimation;

        console.log("Current animation ID", this.currentAnimationId);
        console.log("Current settings", currentSettings);
        console.log(
          "Creating canvas with EXACT dimensions",
          this.width,
          this.height
        );

        // Create canvas with EXACT dimensions
        p.createCanvas(this.width, this.height);
        p.frameRate(this.fps);
        p.background(0);

        // Force pixel density to 1 for exact pixel matching
        p.pixelDensity(1);
        console.log(
          `Canvas created with EXACT dimensions ${this.width}x${this.height}`
        );

        console.log("Current animation ID", this.currentAnimationId);
        console.log("Current settings", currentSettings);

        // Call onSetup function if it exists in the animation settings
        if (currentSettings.onSetup) {
          console.log(`Running onSetup for ${this.currentAnimationId}`);
          currentSettings.onSetup(
            p,
            this.normalizedTime,
            this._currentFrame,
            this.totalFrames
          );
        }

        // We don't want P5's automatic animation loop - we'll control it
        p.noLoop();
      };

      p.draw = () => {
        // Only redraw if we have a sketch function
        if (this.sketchFunction) {
          try {
            // Clear canvas
            // p.clear();
            // p.background(0);

            // Execute sketch function with current animation state
            this.sketchFunction(
              p,
              this.normalizedTime,
              this._currentFrame,
              this.totalFrames
            );
          } catch (error) {
            console.error("Error executing sketch:", error);
            this.drawErrorState(p, error);
          }
        } else {
          this.drawLoadingState(p);
        }
      };

      // Resize canvas when window resizes - NOT NEEDED since we use exact dimensions
      p.windowResized = () => {
        // Do nothing - we want to keep the exact dimensions
        console.log("Window resize ignored - keeping exact canvas dimensions");
      };
    };

    this.p5Instance = new p5(sketch, container);
  }

  // Clean up resources
  destroy(): void {
    this.stopAnimationLoop();
    if (this.p5Instance) {
      this.p5Instance.remove();
      this.p5Instance = null;
    }

    this.onFrameChangedCallbacks = [];
    this.onPlayStateChangedCallbacks = [];
  }

  // Animation loop control
  private startAnimationLoop(): void {
    this.stopAnimationLoop();
    this.lastUpdateTimeRef = 0;
    this.animationFrameRef = requestAnimationFrame(this.updateFrame);
  }

  private stopAnimationLoop(): void {
    if (this.animationFrameRef !== null) {
      cancelAnimationFrame(this.animationFrameRef);
      this.animationFrameRef = null;
    }
  }

  // Frame update logic using requestAnimationFrame
  private updateFrame = (timestamp: number): void => {
    if (!this.lastUpdateTimeRef) {
      this.lastUpdateTimeRef = timestamp;
    }

    const deltaTime = timestamp - this.lastUpdateTimeRef;
    const frameTime = 1000 / this.fps; // Time per frame in ms

    // Only update if enough time has passed for a frame
    if (deltaTime >= frameTime) {
      this.currentFrame =
        this._currentFrame + 1 >= this.totalFrames ? 0 : this._currentFrame + 1;
      this.lastUpdateTimeRef = timestamp;

      // Redraw P5 canvas with new frame
      this.redraw();
    }

    if (this._isPlaying) {
      this.animationFrameRef = requestAnimationFrame(this.updateFrame);
    }
  };

  // Redraw the P5 canvas
  redraw(): void {
    if (this.p5Instance) {
      this.p5Instance.redraw();
    }
  }

  // Compile sketch code to function
  private compileSketchFunction(): void {
    try {
      this.sketchFunction = new Function(
        "p",
        "normalizedTime",
        "frameNumber",
        "totalFrames",
        this._sketchCode
      ) as AnimationFunction;
    } catch (error) {
      console.error("Error compiling sketch code:", error);
      this.sketchFunction = null;
    }
  }

  // Reset animation to first frame
  reset(): void {
    this.isPlaying = false;
    this.currentFrame = 0;
    this.redraw();
  }

  // Register for frame change notifications
  onFrameChanged(
    callback: (frame: number, normalizedTime: number) => void
  ): () => void {
    this.onFrameChangedCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.onFrameChangedCallbacks = this.onFrameChangedCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  // Register for play state change notifications
  onPlayStateChanged(callback: (isPlaying: boolean) => void): () => void {
    this.onPlayStateChangedCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.onPlayStateChangedCallbacks =
        this.onPlayStateChangedCallbacks.filter((cb) => cb !== callback);
    };
  }

  // Notify all subscribers of frame change
  private notifyFrameChanged(): void {
    for (const callback of this.onFrameChangedCallbacks) {
      callback(this._currentFrame, this.normalizedTime);
    }
  }

  // Notify all subscribers of play state change
  private notifyPlayStateChanged(): void {
    for (const callback of this.onPlayStateChangedCallbacks) {
      callback(this._isPlaying);
    }
  }

  // Helper method to display error state
  private drawErrorState(p: p5, error: unknown): void {
    p.background(255, 0, 0);
    p.fill(255);
    p.textSize(24);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      p.width / 2,
      p.height / 2
    );
  }

  // Helper method to display loading state
  private drawLoadingState(p: p5): void {
    p.background(0);
    p.fill(255);
    p.textSize(24);
    p.textAlign(p.CENTER, p.CENTER);
    p.text("Loading sketch...", p.width / 2, p.height / 2);
  }

  // Set animation and update settings
  setAnimation(id: AnimationName = defaultAnimation.id): void {
    console.log(`Setting animation to: ${id}`);
    this.currentAnimationId = id;
    const animation = animations[id] || defaultAnimation.function;

    // Get the animation settings
    const settings = animationSettings[id] || defaultAnimation;

    if (settings) {
      // Update controller with animation settings
      this.fps = settings.fps;
      this.totalFrames = settings.totalFrames;
      this.width = settings.width;
      this.height = settings.height;

      console.log(
        `Using animation settings: fps=${this.fps}, totalFrames=${this.totalFrames}, width=${this.width}, height=${this.height}`
      );
    }

    if (animation) {
      this.setAnimationFunction(animation);
    }

    // If p5 instance exists, properly destroy and recreate it with the new animation
    if (this.containerElement) {
      if (this.p5Instance) {
        console.log("Removing existing P5 instance");
        this.p5Instance.remove();
        this.p5Instance = null;
      }
      
      console.log("Reinitializing P5 instance with new animation");
      this.initializeP5(this.containerElement);
    } else {
      console.warn("No container element available to reinitialize P5");
    }

    // Reset animation state
    this.reset();
  }
}

// Create a global singleton instance
export const createAnimationController = (
  fps: number,
  totalFrames: number,
  width: number,
  height: number
): AnimationController => {
  return new AnimationController(fps, totalFrames, width, height);
};
