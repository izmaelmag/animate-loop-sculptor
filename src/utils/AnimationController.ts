import p5 from "p5";
import {
  animations,
  animationSettings,
  defaultAnimation,
  AnimationName,
} from "@/animations";
import { AnimationFunction } from "@/types/animations";

export class AnimationController {
  //-------------------------------------
  // Private properties
  //-------------------------------------
  private p5Instance: p5 | null = null;
  private sketchFunction: AnimationFunction | null = null;
  private animationFrameRef: number | null = null;
  private currentAnimationId: AnimationName = defaultAnimation.id;
  private containerElement: HTMLElement | null = null;

  // Animation state
  private _currentFrame: number = 0;
  private _isPlaying: boolean = false;

  // Callbacks
  private onFrameChangedCallbacks: ((
    frame: number,
    normalizedTime: number
  ) => void)[] = [];
  private onPlayStateChangedCallbacks: ((isPlaying: boolean) => void)[] = [];
  private onSettingsChangedCallbacks: ((
    fps: number,
    totalFrames: number,
    width: number,
    height: number
  ) => void)[] = [];

  //-------------------------------------
  // Public properties
  //-------------------------------------
  public fps: number;
  public totalFrames: number;
  public width: number;
  public height: number;

  //-------------------------------------
  // Constructor
  //-------------------------------------
  constructor(animationId: AnimationName = defaultAnimation.id) {
    // Set the initial animation ID
    this.currentAnimationId = animationId;

    // Get animation settings
    const settings = animationSettings[animationId] || defaultAnimation;

    // Initialize with animation settings
    this.fps = settings.fps;
    this.totalFrames = settings.totalFrames;
    this.width = settings.width || 1080; // Default width if not specified
    this.height = settings.height || 1920; // Default height if not specified
  }

  //-------------------------------------
  // Animation state getters/setters
  //-------------------------------------
  get normalizedTime(): number {
    const isManyFrames = this.totalFrames > 1;

    if (!isManyFrames) {
      return 0;
    }

    return this._currentFrame / (this.totalFrames - 1);
  }

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

  //-------------------------------------
  // Animation settings methods
  //-------------------------------------
  setTotalFrames(totalFrames: number): void {
    if (totalFrames > 0 && this.totalFrames !== totalFrames) {
      this.totalFrames = totalFrames;
      this._currentFrame = 0;

      this.notifyFrameChanged();
      this.notifySettingsChanged();
    }
  }

  setAnimationFunction(animationFn: AnimationFunction): void {
    this.sketchFunction = animationFn;
    this.redraw();
  }

  setAnimation(id: AnimationName = defaultAnimation.id): void {
    const previousId = this.currentAnimationId;
    this.currentAnimationId = id;

    const animation = animations[id] || defaultAnimation.function;
    const settings = animationSettings[id] || defaultAnimation;

    // Stop playback when changing animations
    if (previousId !== id && this._isPlaying) {
      this._isPlaying = false;
    }

    // Update controller with animation settings
    this.fps = settings.fps;
    this.totalFrames = settings.totalFrames;
    this.width = settings.width || 1080;
    this.height = settings.height || 1920;

    // Reset to frame 0 if animation changed or current frame exceeds bounds
    if (previousId !== id || this._currentFrame >= this.totalFrames) {
      this._currentFrame = 0;
    }

    // Set the animation function
    this.setAnimationFunction(animation);

    // Reinitialize P5 instance if container exists
    if (this.containerElement) {
      if (this.p5Instance) {
        this.p5Instance.remove();
        this.p5Instance = null;
      }
      this.initializeP5(this.containerElement);
    }

    // Notify all listeners of state changes
    this.notifyPlayStateChanged();
    this.notifyFrameChanged();
    this.notifySettingsChanged();

    // Force a redraw
    this.redraw();
  }

  //-------------------------------------
  // Animation control methods
  //-------------------------------------
  reset(): void {
    // Always stop playback and reset to frame 0
    this._isPlaying = false;
    this._currentFrame = 0;

    // Notify all listeners
    this.notifyPlayStateChanged();
    this.notifyFrameChanged();

    // Redraw the canvas
    this.redraw();
  }

  redraw(): void {
    if (this.p5Instance) {
      this.p5Instance.redraw();
    }
  }

  //-------------------------------------
  // P5.js lifecycle methods
  //-------------------------------------
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

        // Create canvas with exact dimensions and WEBGL renderer
        p.createCanvas(this.width, this.height, p.WEBGL);
        p.frameRate(this.fps);
        p.background(0);

        // Force pixel density to 1 for exact pixel matching
        p.pixelDensity(1);

        // Call onSetup function if it exists in the animation settings
        if (currentSettings.onSetup) {
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
    };

    this.p5Instance = new p5(sketch, container);
  }

  destroy(): void {
    this.stopAnimationLoop();

    if (this.p5Instance) {
      this.p5Instance.remove();
      this.p5Instance = null;
    }

    // Clear all callbacks
    this.onFrameChangedCallbacks = [];
    this.onPlayStateChangedCallbacks = [];
    this.onSettingsChangedCallbacks = [];

    // Clear the container element
    this.containerElement = null;
  }

  //-------------------------------------
  // Animation frame loop methods
  //-------------------------------------
  private startAnimationLoop(): void {
    this.stopAnimationLoop();
    this.updateFrame();
  }

  private stopAnimationLoop(): void {
    if (this.animationFrameRef !== null) {
      cancelAnimationFrame(this.animationFrameRef);
      this.animationFrameRef = null;
    }
  }

  private updateFrame = (): void => {
    // Simply advance to the next frame
    this.currentFrame =
      this._currentFrame + 1 >= this.totalFrames ? 0 : this._currentFrame + 1;

    // Redraw P5 canvas with new frame
    this.redraw();

    // Continue the animation loop if still playing using setTimeout
    // to control frame rate instead of relying on requestAnimationFrame timing
    if (this._isPlaying) {
      const frameDelay = 1000 / this.fps; // Time between frames in ms
      setTimeout(() => {
        this.animationFrameRef = requestAnimationFrame(this.updateFrame);
      }, frameDelay);
    }
  };

  //-------------------------------------
  // P5 helper methods
  //-------------------------------------
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

  private drawLoadingState(p: p5): void {
    p.background(0);
    p.fill(255);
    p.textSize(24);
    p.textAlign(p.CENTER, p.CENTER);
    p.text("Loading sketch...", p.width / 2, p.height / 2);
  }

  //-------------------------------------
  // Observer pattern methods
  //-------------------------------------
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

  onPlayStateChanged(callback: (isPlaying: boolean) => void): () => void {
    this.onPlayStateChangedCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.onPlayStateChangedCallbacks =
        this.onPlayStateChangedCallbacks.filter((cb) => cb !== callback);
    };
  }

  onSettingsChanged(
    callback: (
      fps: number,
      totalFrames: number,
      width: number,
      height: number
    ) => void
  ): () => void {
    this.onSettingsChangedCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.onSettingsChangedCallbacks = this.onSettingsChangedCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  private notifyFrameChanged(): void {
    for (const callback of this.onFrameChangedCallbacks) {
      callback(this._currentFrame, this.normalizedTime);
    }
  }

  private notifyPlayStateChanged(): void {
    for (const callback of this.onPlayStateChangedCallbacks) {
      callback(this._isPlaying);
    }
  }

  private notifySettingsChanged(): void {
    for (const callback of this.onSettingsChangedCallbacks) {
      callback(this.fps, this.totalFrames, this.width, this.height);
    }
  }
}
