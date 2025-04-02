import { easeInOutCubic } from "../easing";

/**
 * Number array change animation configuration
 */
interface ChangeConfig {
  targetValues: number[];
  startFrame: number;
  endFrame: number;
}

/**
 * Numset class for animating changes to arrays of numbers with frame-based timing
 */
export class Numset {
  /** Current values */
  private _values: number[];
  
  /** Initial values */
  private _initialValues: number[];
  
  /** Queued changes */
  private _changes: ChangeConfig[] = [];
  
  /** Easing function for animations */
  private _easing: (t: number) => number = easeInOutCubic;
  
  /**
   * Creates a new Numset instance
   * @param initialValues Initial array of numbers
   */
  constructor(initialValues: number[]) {
    this._values = [...initialValues];
    this._initialValues = [...initialValues];
  }
  
  /**
   * Get current values
   */
  get values(): number[] {
    return [...this._values];
  }
  
  /**
   * Get value at specified index
   * @param index Index of the value to retrieve
   */
  public valueAt(index: number): number {
    if (index < 0 || index >= this._values.length) {
      console.warn(`Numset: Index ${index} out of bounds`);
      return 0;
    }
    return this._values[index];
  }
  
  /**
   * Schedule change animation to new values
   * @param targetValues Target array of numbers
   * @param startFrame Frame when change should start
   * @param duration Duration of change in frames
   */
  public change(
    targetValues: number[],
    startFrame: number,
    duration: number
  ): void {
    if (duration <= 0) {
      console.warn("Numset: Animation duration must be positive");
      duration = 1;
    }
    
    if (targetValues.length !== this._initialValues.length) {
      console.warn("Numset: Target values array length doesn't match initial length");
      // Adjust target array length to match initial array
      if (targetValues.length < this._initialValues.length) {
        // Pad with zeros if target is too short
        targetValues = [...targetValues, ...Array(this._initialValues.length - targetValues.length).fill(0)];
      } else {
        // Truncate if target is too long
        targetValues = targetValues.slice(0, this._initialValues.length);
      }
    }
    
    const changeConfig: ChangeConfig = {
      targetValues: [...targetValues],
      startFrame,
      endFrame: startFrame + duration
    };
    
    this._changes.push(changeConfig);
  }
  
  /**
   * Updates the numset's values based on the current frame
   * @param frame Current animation frame
   */
  public step(frame: number): void {
    // For frame 0, reset to initial values but don't modify animation sequence
    if (frame === 0) {
      this._values = [...this._initialValues];
      return;
    }
    
    // Create a working copy of changes to avoid modifying the original sequence
    let pendingChanges = [...this._changes];
    
    // Reset values to initial for fresh calculation
    this._values = [...this._initialValues];
    
    // Find all changes that should be complete by this frame
    let lastCompletedChange: ChangeConfig | null = null;
    
    for (let i = 0; i < pendingChanges.length; i++) {
      const change = pendingChanges[i];
      if (frame >= change.endFrame) {
        lastCompletedChange = change;
      } else {
        break;
      }
    }
    
    // If we have completed changes, set values to the last one's target
    if (lastCompletedChange) {
      this._values = [...lastCompletedChange.targetValues];
      
      // Remove all completed changes from our working copy
      pendingChanges = pendingChanges.filter(c => frame < c.endFrame);
    }
    
    // Check if we're in the middle of a change
    if (pendingChanges.length > 0) {
      const currentChange = pendingChanges[0];
      
      if (frame >= currentChange.startFrame && frame < currentChange.endFrame) {
        // We're in this change - calculate values
        const rawProgress = (frame - currentChange.startFrame) / 
                          (currentChange.endFrame - currentChange.startFrame);
        const progress = this._easing(this._clamp(rawProgress, 0, 1));
        
        // Get starting values - either last completed change's target or initial values
        const startValues = lastCompletedChange 
                          ? [...lastCompletedChange.targetValues] 
                          : [...this._initialValues];
        
        // Update each value through interpolation
        for (let i = 0; i < this._values.length; i++) {
          this._values[i] = this._lerp(startValues[i], currentChange.targetValues[i], progress);
        }
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
   * Clears all scheduled changes
   */
  public clearChanges(): void {
    this._changes = [];
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