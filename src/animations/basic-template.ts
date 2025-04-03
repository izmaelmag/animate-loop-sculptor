import p5 from "p5";
import { AnimationFunction, AnimationSettings } from "@/types/animations";

/*
 * Starter Animation Template
 *
 * @param {object} p - p5 instance
 * @param {number} t - normalized total time from 0 to 1
 * @param {number} frame - current frame number
 * @param {number} totalFrames - total number of frames in the video
 */
const animation: AnimationFunction = (
  p: p5,
  normalizedTime: number,
  frameNumber: number,
  totalFrames: number
) => {
  // Clear the canvas to prevent flickering
  p.background(0);
};

const setupAnimation: AnimationFunction = (p: p5) => {
  // Setup code here
};

export const settings: AnimationSettings = {
  name: "Basic",
  id: "basic",
  fps: 60,
  totalFrames: 600,
  sequential: false,
  function: animation,
  onSetup: setupAnimation,
};
