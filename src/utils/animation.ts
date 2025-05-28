import p5 from "p5";

/**
 * Maps a normalized time value (0-1) to a frame number
 * @param normalizedTime Time value from 0 to 1
 * @param totalFrames Total number of frames in the animation
 * @returns The frame number (0 to totalFrames-1)
 */
export const normalizedTimeToFrame = (
  normalizedTime: number,
  totalFrames: number
): number => {
  // Ensure normalizedTime is within 0-1 range
  const clampedTime = Math.max(0, Math.min(1, normalizedTime));

  // Map to frame number (0 to totalFrames-1)
  return Math.floor(clampedTime * totalFrames) % totalFrames;
};

/**
 * Converts a frame number to normalized time
 * @param frame The current frame number
 * @param totalFrames Total number of frames in the animation
 * @returns Normalized time (0-1)
 */
export const frameToNormalizedTime = (
  frame: number,
  totalFrames: number
): number => {
  // Ensure frame is within valid range
  const clampedFrame = Math.max(0, Math.min(totalFrames - 1, frame));

  // Avoid divide-by-zero and match AnimationController.normalizedTime
  if (totalFrames <= 1) {
    return 0;
  }

  // Convert to normalized time (0-1)
  // Use totalFrames - 1 so the last frame maps exactly to 1
  return clampedFrame / (totalFrames - 1);
};

/**
 * Ensures a proper loop by avoiding the same start and end frame
 * @param normalizedTime Current normalized time (0-1)
 * @param totalFrames Total number of frames
 * @returns The looping frame number
 */
export const getLoopingFrame = (
  normalizedTime: number,
  totalFrames: number
): number => {
  // Get the frame number
  const frame = normalizedTimeToFrame(normalizedTime, totalFrames);

  // If we're at the last frame, return 0 to create a proper loop
  // This ensures frame totalFrames-1 transitions to frame 0, not to itself
  return frame === totalFrames - 1 ? 0 : frame;
};

/**
 * Create a P5.js sketch function with normalized time handling
 * @param sketchCode The sketch code to execute
 * @param normalizedTime The current normalized time (0-1)
 * @returns A P5.js sketch function
 */
export const createSketchWithNormalizedTime = (
  sketchCode: string,
  normalizedTime: number
) => {
  return (p: p5) => {
    // Create a function from the sketch code string
    const sketchFn = new Function("p", "normalizedTime", sketchCode);

    p.setup = () => {
      // Create canvas with Instagram Reels aspect ratio (9:16)
      p.createCanvas(1080, 1920);
      p.frameRate(60);
    };

    p.draw = () => {
      // Call the sketch function with the normalized time
      sketchFn(p, normalizedTime);
    };
  };
};
