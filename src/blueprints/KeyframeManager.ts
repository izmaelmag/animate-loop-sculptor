// KFManager – Keyframes Manager
// A tool for updating values in time based on frames
// Aimed to draw mathematical graphs and animations in a declarative way

// This is a proposal for a new way to manage keyframes.
// Main goal is to develop a flexible yet simple in use declarative value updater
// Timing is based on frames
// I need it to have a simple interface do describe canvas rendering animations in time
// It should work in a headless browser due to remotion library rendering in node.js environment

// Use easing functions from this file
import { easeInOutCubic } from "../utils/easing";

// Default linear easing function if none provided
const linear = (t: number): number => t;

interface SequenceParams {
  frame?: number;
  value?: number;
  wait?: number;
  easingFn?: (t: number) => number;
}

// Helper type for nested objects with numeric leaf values
type NestedNumberRecord = {
  [key: string]: number | NestedNumberRecord;
};

// Path string type for accessing nested properties
type PropertyPath = string;

class KFManager<T extends NestedNumberRecord> {
  // Local store for the values as a SSoT
  private _store: T;

  // Sequences for each key
  private _sequences: Record<PropertyPath, SequenceParams[]>;

  // Initial store and associated sequences
  constructor(store: T) {
    // Set initial store
    this._store = { ...store };

    // Create sequences object for flat paths
    this._sequences = {} as Record<PropertyPath, SequenceParams[]>;
  }

  /**
   * Gets a value from a nested object using a dot-notation path
   * @param obj The object to get the value from
   * @param path The path to the value (e.g. "point.x")
   * @returns The value at the path
   */
  private getValueByPath(obj: T | NestedNumberRecord, path: PropertyPath): number {
    const keys = path.split(".");
    let current: T | NestedNumberRecord | number = obj;

    for (const key of keys) {
      if (current === undefined || current === null || typeof current === 'number') {
        return 0; // Default value if path is invalid
      }
      current = current[key];
    }

    return typeof current === "number" ? current : 0;
  }

  /**
   * Sets a value in a nested object using a dot-notation path
   * @param obj The object to set the value in
   * @param path The path to set the value at (e.g. "point.x")
   * @param value The value to set
   * @returns A new object with the updated value
   */
  private setValueByPath(obj: T, path: PropertyPath, value: number): T {
    const keys = path.split(".");
    const lastKey = keys.pop()!;

    // Create a deep copy of the object
    const result = JSON.parse(JSON.stringify(obj)) as T;

    // Navigate to the right nesting level
    let current: NestedNumberRecord = result;
    for (const key of keys) {
      if (current[key] === undefined) {
        current[key] = {};
      }
      if (typeof current[key] === 'number') {
        // If we encounter a number where we expect an object, replace it with an empty object
        current[key] = {};
      }
      current = current[key] as NestedNumberRecord;
    }

    // Set the value
    current[lastKey] = value;

    return result;
  }

  // Creates a sequence for a key
  // Should not be used in a drawing loop
  // Only for declarative usage
  public createSequence(path: PropertyPath, frames: SequenceParams[]): void {
    // Process frames to handle wait periods
    const processedFrames: SequenceParams[] = [];
    let waitAccumulator = 0;

    for (const frame of frames) {
      if (frame.wait !== undefined) {
        // Add wait to accumulator
        waitAccumulator += frame.wait;
        // Don't push wait entries to processedFrames, just accumulate the wait value
      } else if (frame.frame !== undefined) {
        // Apply accumulated wait to the frame
        processedFrames.push({
          ...frame,
          frame: frame.frame + waitAccumulator,
          easingFn: frame.easingFn || linear,
        });
      }
    }

    this._sequences[path] = processedFrames;
  }

  // This function runs in a drawing loop and uses
  // internal sequences to change values
  public animate(currentFrame: number): T {
    // Start with a copy of the store
    let updatedStore = JSON.parse(JSON.stringify(this._store));

    // Update each value based on its sequence
    for (const path of Object.keys(this._sequences)) {
      const sequence = this._sequences[path];

      // Filter only frame/value keyframes (not wait periods)
      const keyframes = sequence.filter(
        (frame) => frame.frame !== undefined && frame.value !== undefined
      ) as Array<
        Required<Pick<SequenceParams, "frame" | "value">> & {
          easingFn?: (t: number) => number;
        }
      >;

      if (keyframes.length === 0) continue;

      // Sort keyframes by frame
      keyframes.sort((a, b) => a.frame - b.frame);

      let newValue: number;

      // Handle before first keyframe
      if (currentFrame <= keyframes[0].frame) {
        newValue = keyframes[0].value;
      }
      // Handle after last keyframe
      else if (currentFrame >= keyframes[keyframes.length - 1].frame) {
        newValue = keyframes[keyframes.length - 1].value;
      }
      // Handle in-between keyframes
      else {
        // Find surrounding keyframes
        let startKeyframe = keyframes[0];
        let endKeyframe = keyframes[1];

        for (let i = 1; i < keyframes.length; i++) {
          if (currentFrame <= keyframes[i].frame) {
            startKeyframe = keyframes[i - 1];
            endKeyframe = keyframes[i];
            break;
          }
        }

        // Calculate progress between keyframes (0 to 1)
        const duration = endKeyframe.frame - startKeyframe.frame;
        const progress = (currentFrame - startKeyframe.frame) / duration;

        // Apply easing function if available
        const easingFn = endKeyframe.easingFn || linear;
        const easedProgress = easingFn(progress);

        // Interpolate value
        newValue =
          startKeyframe.value +
          (endKeyframe.value - startKeyframe.value) * easedProgress;
      }

      // Update the store with the new value
      updatedStore = this.setValueByPath(updatedStore, path, newValue);
    }

    // Update the internal store
    this._store = updatedStore;

    return this._store;
  }

  // Returns the current store for any usage
  get store(): T {
    return JSON.parse(JSON.stringify(this._store));
  }

  // Overwrites a value for manual control
  // It will be used to set a value directly without animation
  // Should be used in the drawing loop after the animate method
  overwrite(path: PropertyPath, value: number): void {
    this._store = this.setValueByPath(this._store, path, value);
  }
}

// ===============================================================================================
// Example usage (code below is not real and must be treated as an instruction of class usage)
// Usage updates allow ONLY if class implementation can not be done in a declared way
// ===============================================================================================

// Example usage with nested objects
// Create a store with nested values
const STORE = {
  p1: { x: 0, y: 0 },
  p2: { x: 0, y: 0 },
  p3: { x: 0, y: 0 },
  radius: 10,
};

// Creating a manager for the store
const kf = new KFManager(STORE);

// Creating a sequence for p1.x using dot notation
kf.createSequence("p1.x", [
  { frame: 0, value: 0 },
  { wait: 100 },
  { frame: 100, value: 100 },
  { frame: 200, value: 0 },
]);

// Creating a sequence for p1.y
kf.createSequence("p1.y", [
  { wait: 100 },
  { frame: 0, value: 0 },
  { wait: 100 },
  { frame: 100, value: 100 },
  { frame: 200, value: 0 },
]);

// Creating a sequence for the flat property "radius"
kf.createSequence("radius", [
  { frame: 0, value: 10 },
  { frame: 100, value: 30 },
  { frame: 200, value: 10 },
]);

// Drawing loop example
const drawingLoop = (currentFrame: number) => {
  const values = kf.animate(currentFrame);

  // Access nested properties
  const { p1, p2, radius } = values;

  drawShape(p1.x, p1.y, p2.x, p2.y, radius);
};

// Some drawing function
const drawShape = (
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  radius: number
) => {
  console.log(p1x, p1y, p2x, p2y, radius);
  // ...
};

export { KFManager };
export type { SequenceParams };
