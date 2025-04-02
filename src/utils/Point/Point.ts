import { easeInOutCubic } from "../easing";

/**
 * Movement animation configuration
 */
interface MovementConfig {
  targetPosition: [number, number];
  startFrame: number;
  endFrame: number;
}

/**
 * Point class for animating position changes with frame-based timing
 */
export class Point {
  /** Current position [x, y] */
  private _position: [number, number];
  
  /** Initial position [x, y] */
  private _initialPosition: [number, number];
  
  /** Queued movement animations */
  private _movements: MovementConfig[] = [];
  
  /** Current active movement */
  private _currentMovement: MovementConfig | null = null;
  
  /** Starting position for current movement */
  private _startPosition: [number, number] = [0, 0];
  
  /** Easing function for animations */
  private _easing: (t: number) => number = easeInOutCubic;
  
  /**
   * Creates a new Point instance
   * @param x Initial x coordinate
   * @param y Initial y coordinate
   */
  constructor(x: number, y: number) {
    this._position = [x, y];
    this._initialPosition = [x, y];
  }
  
  /**
   * Get current position
   */
  get position(): [number, number] {
    return [...this._position];
  }
  
  /**
   * Get current x coordinate
   */
  get x(): number {
    return this._position[0];
  }
  
  /**
   * Get current y coordinate
   */
  get y(): number {
    return this._position[1];
  }
  
  /**
   * Schedule movement animation to a new position
   * @param targetPosition Target [x, y] position
   * @param startFrame Frame when movement should start
   * @param duration Duration of movement in frames
   */
  public moveTo(
    targetPosition: [number, number],
    startFrame: number,
    duration: number
  ): void {
    if (duration <= 0) {
      console.warn("Point: Animation duration must be positive");
      duration = 1;
    }
    
    const movement: MovementConfig = {
      targetPosition: [...targetPosition],
      startFrame,
      endFrame: startFrame + duration
    };
    
    this._movements.push(movement);
  }
  
  /**
   * Updates the point's position based on the current frame
   * @param frame Current animation frame
   */
  public step(frame: number): void {
    // For frame 0, reset to initial position but don't modify animation sequences
    if (frame === 0) {
      this._position = [...this._initialPosition];
      this._currentMovement = null;
      return;
    }
    
    // Create a working copy of movements to avoid modifying the original sequence
    let pendingMovements = [...this._movements];
    this._currentMovement = null;
    
    // Reset position to initial for fresh calculation
    this._position = [...this._initialPosition];
    
    // Find all movements that should be complete by this frame
    let lastCompletedMovement: MovementConfig | null = null;
    
    for (let i = 0; i < pendingMovements.length; i++) {
      const movement = pendingMovements[i];
      if (frame >= movement.endFrame) {
        lastCompletedMovement = movement;
      } else {
        break;
      }
    }
    
    // If we have completed movements, set position to the last one's target
    if (lastCompletedMovement) {
      this._position = [...lastCompletedMovement.targetPosition];
      
      // Remove all completed movements from our working copy
      pendingMovements = pendingMovements.filter(m => frame < m.endFrame);
    }
    
    // Check if we're in the middle of a movement
    if (pendingMovements.length > 0) {
      const currentMovement = pendingMovements[0];
      
      if (frame >= currentMovement.startFrame && frame < currentMovement.endFrame) {
        // We're in this movement - calculate position
        const rawProgress = (frame - currentMovement.startFrame) / 
                          (currentMovement.endFrame - currentMovement.startFrame);
        const progress = this._easing(this._clamp(rawProgress, 0, 1));
        
        // Get starting position - either last completed movement's target or initial position
        const startPosition = lastCompletedMovement 
                            ? [...lastCompletedMovement.targetPosition] 
                            : [...this._initialPosition];
        
        // Update position through interpolation
        this._position = [
          this._lerp(startPosition[0], currentMovement.targetPosition[0], progress),
          this._lerp(startPosition[1], currentMovement.targetPosition[1], progress)
        ];
      }
    }
  }
  
  /**
   * Sets a custom easing function for animations
   * @param easing The easing function to use (takes and returns a value from 0 to 1)
   */
  public setEasing(easing: (t: number) => number): void {
    this._easing = easing;
  }
  
  /**
   * Clears all scheduled movements
   */
  public clearMovements(): void {
    this._movements = [];
    this._currentMovement = null;
  }
  
  /**
   * Linear interpolation between two values
   * @param a Start value
   * @param b End value
   * @param t Progress (0 to 1)
   * @returns Interpolated value
   */
  private _lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
  
  /**
   * Clamps a value between min and max
   * @param value Value to clamp
   * @param min Minimum value
   * @param max Maximum value
   * @returns Clamped value
   */
  private _clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
  }
} 