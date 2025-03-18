import { AnimationSettings } from "@/types/animations";
import p5 from "p5";

export const settings: AnimationSettings = {
  name: "Multilayered",
  id: "multilayered",
  duration: 10,
  fps: 60,
  totalFrames: 600,
  width: 1080,
  height: 1920,
  sequential: false,
  function: animation,
  onSetup: setupAnimation,
};

/**
 * Setup function that runs once before the animation starts
 */
export function setupAnimation(p: p5) {
  p.background(0);
}

/*
 * Grid Orbit Animation
 *
 * @param {object} p - p5 instance
 * @param {number} t - normalized total time from 0 to 1
 * @param {number} frame - current frame number
 * @param {number} totalFrames - total number of frames in the video
 */
export function animation(
  p: p5,
  t: number,
  frame: number,
  totalFrames: number
) {
  // Clear the canvas
  p.background(0);

  // Draw a circle
  p.ellipse(p.width / 2, p.height / 2, 100, 100);
}
