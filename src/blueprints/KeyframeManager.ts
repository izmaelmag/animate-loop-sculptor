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

class KFManager<T extends Record<string, number>> {
  // Local store for the values as a SSoT
  private _store: T;

  // Sequences for each key
  private _sequences: Record<keyof T, SequenceParams[]>;

  // Initial store and associated sequences
  constructor(store: T) {
    // Set initial store
    this._store = { ...store };

    // Create sequential arrays for each key to avoid mutating the original store
    this._sequences = Object.keys(store).reduce((acc, key) => {
      acc[key as keyof T] = [];
      return acc;
    }, {} as Record<keyof T, SequenceParams[]>);
  }

  // Creates a sequence for a key
  // Should not be used in a drawing loop
  // Only for declarative usage
  public createSequence(key: keyof T, frames: SequenceParams[]): void {
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

    this._sequences[key] = processedFrames;
  }

  // This function runs in a drawing loop and uses
  // internal sequences to change values
  public animate(currentFrame: number): T {
    // Create a copy of the store to update
    const updatedStore = { ...this._store };

    // Update each value based on its sequence
    for (const key of Object.keys(this._sequences) as Array<keyof T>) {
      const sequence = this._sequences[key];

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

      // Handle before first keyframe
      if (currentFrame <= keyframes[0].frame) {
        updatedStore[key] = keyframes[0].value as T[keyof T];
        continue;
      }

      // Handle after last keyframe
      if (currentFrame >= keyframes[keyframes.length - 1].frame) {
        updatedStore[key] = keyframes[keyframes.length - 1].value as T[keyof T];
        continue;
      }

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
      const newValue =
        startKeyframe.value +
        (endKeyframe.value - startKeyframe.value) * easedProgress;

      updatedStore[key] = newValue as T[keyof T];
    }

    // Update the internal store
    this._store = updatedStore;

    return this._store;
  }

  // Returns the current store for any usage
  get store(): T {
    return { ...this._store };
  }

  // Overwrites a value for manual control
  // It will be used to set a value directly without animation
  // Should be used in the drawing loop after the animate method
  overwrite(key: keyof T, value: T[keyof T]): void {
    this._store[key] = value;
  }
}

// ===============================================================================================
// Example usage (code below is not real and must be treated as an instruction of class usage)
// Usage updates allow ONLY if class implementation can not be done in a declared way
// ===============================================================================================

// Creating a global state for animated values
// Store is flat for simplicity
// Maybe it's better to use a nested store for more complex animations
// But flatten it in a way that is easy to manage
// Like this: { p1: { x: 0, y: 0 } }
// Turns into: { p1x: 0, p1y: 0 }
// Or into: { "p1.x": 0, "p1.y": 0 }
// Flat store allows to use the same key for different properties
// And it's easier to update values in the drawing loop
// Boolean – maybe??? IDK
const STORE = {
  p1x: 0,
  p1y: 0,
  p2x: 0,
  p2y: 0,
  p3x: 0,
  p3y: 0,
};

// Creating a manager for the store
// Maybe we need to pass more options?
// But less is better
const kf = new KFManager(STORE);

// Creating a sequence for p1x
// It will be animated from 0 to 100 in 100 frames [0, 100]
// Then it will wait for 100 frames [100, 200]
// Then it will animate from 100 to 0 in 100 frames [200, 300]
kf.createSequence("p1x", [
  { frame: 0, value: 0 },
  { wait: 100 },
  { frame: 100, value: 100 },
  { frame: 200, value: 0 },
]);

// Creating a sequence for p1y
// It will wait for 100 frames [0, 100]
// Then it will animate from 0 to 100 in 100 frames [100, 200]
// Then it will wait for 100 frames [200, 300]
// Then it will animate from 100 to 0 in 100 frames [300, 400]
kf.createSequence("p1y", [
  { wait: 100 },
  { frame: 0, value: 0 },
  { wait: 100 },
  { frame: 100, value: 100 },
  { frame: 200, value: 0 },
]);

// Drawing loop
// It's not important for the example
// No need to implement it
// Just an example of the usage
const drawingLoop = (currentFrame: number) => {
  const { p1x, p1y, p2x, p2y } = kf.animate(currentFrame);

  drawShape(p1x, p1y, p2x, p2y);
};

// Some drawing function
// It's not important for the example
// No need to implement it
const drawShape = (p1x: number, p1y: number, p2x: number, p2y: number) => {
  console.log(p1x, p1y, p2x, p2y);
  // ...
};

export { KFManager };
export type { SequenceParams };
