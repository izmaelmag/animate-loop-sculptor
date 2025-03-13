
import p5 from 'p5';

export class AnimationController {
  private p5Instance: p5 | null = null;
  private sketchFunction: Function | null = null;
  private animationFrameRef: number | null = null;
  private lastUpdateTimeRef: number = 0;
  
  // Animation settings
  public readonly duration: number;
  public readonly fps: number;
  public readonly totalFrames: number;
  
  // Animation state
  private _currentFrame: number = 0;
  private _isPlaying: boolean = false;
  private _sketchCode: string = '';
  
  // Callbacks
  private onFrameChangedCallbacks: ((frame: number, normalizedTime: number) => void)[] = [];
  private onPlayStateChangedCallbacks: ((isPlaying: boolean) => void)[] = [];
  
  constructor(duration: number, fps: number) {
    this.duration = duration;
    this.fps = fps;
    this.totalFrames = duration * fps;
  }
  
  // Getter for normalized time (0-1)
  get normalizedTime(): number {
    return this.totalFrames > 1 ? this._currentFrame / (this.totalFrames - 1) : 0;
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
  
  // Initialize P5 instance with a container element
  initializeP5(container: HTMLElement): void {
    if (this.p5Instance) {
      this.p5Instance.remove();
    }
    
    const sketch = (p: p5) => {
      p.setup = () => {
        // Create canvas with 9:16 aspect ratio for Instagram Reels
        // Fix: Calculate dimensions based on container height to maintain aspect ratio
        const containerHeight = container.clientHeight;
        const containerWidth = container.clientWidth;
        
        // Determine dimensions that fit within the container while preserving 9:16 ratio
        let canvasWidth, canvasHeight;
        
        // If container is wider than tall (accounting for ratio)
        if (containerWidth / containerHeight > 9/16) {
          // Height limited, width calculated
          canvasHeight = containerHeight;
          canvasWidth = (canvasHeight * 9) / 16;
        } else {
          // Width limited, height calculated
          canvasWidth = containerWidth;
          canvasHeight = (canvasWidth * 16) / 9;
        }
        
        p.createCanvas(canvasWidth, canvasHeight);
        p.frameRate(this.fps);
        p.background(0);
        
        // We don't want P5's automatic animation loop - we'll control it
        p.noLoop();
      };
      
      p.draw = () => {
        // Only redraw if we have a sketch function
        if (this.sketchFunction) {
          try {
            // Clear canvas
            p.clear();
            p.background(0);
            
            // Execute sketch function with current animation state
            this.sketchFunction(
              p, 
              this.normalizedTime, 
              this._currentFrame, 
              this.totalFrames
            );
          } catch (error) {
            console.error('Error executing sketch:', error);
            this.drawErrorState(p, error);
          }
        } else {
          this.drawLoadingState(p);
        }
      };
      
      // Resize canvas when window resizes
      p.windowResized = () => {
        if (container) {
          // Same logic as setup for consistent resizing
          const containerHeight = container.clientHeight;
          const containerWidth = container.clientWidth;
          
          let canvasWidth, canvasHeight;
          
          if (containerWidth / containerHeight > 9/16) {
            // Height limited
            canvasHeight = containerHeight;
            canvasWidth = (canvasHeight * 9) / 16;
          } else {
            // Width limited
            canvasWidth = containerWidth;
            canvasHeight = (canvasWidth * 16) / 9;
          }
          
          p.resizeCanvas(canvasWidth, canvasHeight);
          this.redraw();
        }
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
      this.currentFrame = this._currentFrame + 1 >= this.totalFrames ? 0 : this._currentFrame + 1;
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
        'p', 
        'normalizedTime', 
        'frameNumber', 
        'totalFrames',
        this._sketchCode
      );
    } catch (error) {
      console.error('Error compiling sketch code:', error);
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
  onFrameChanged(callback: (frame: number, normalizedTime: number) => void): () => void {
    this.onFrameChangedCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.onFrameChangedCallbacks = this.onFrameChangedCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Register for play state change notifications
  onPlayStateChanged(callback: (isPlaying: boolean) => void): () => void {
    this.onPlayStateChangedCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.onPlayStateChangedCallbacks = this.onPlayStateChangedCallbacks.filter(cb => cb !== callback);
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
    p.text(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, p.width/2, p.height/2);
  }
  
  // Helper method to display loading state
  private drawLoadingState(p: p5): void {
    p.background(0);
    p.fill(255);
    p.textSize(24);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('Loading sketch...', p.width/2, p.height/2);
  }
}

// Create a global singleton instance
export const createAnimationController = (duration: number, fps: number): AnimationController => {
  return new AnimationController(duration, fps);
};
