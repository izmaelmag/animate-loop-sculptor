import p5 from "p5";
import { AnimationSettings, AnimationFunction } from "@/types/animations";

const FPS = 60;
const WIDTH = 1080;
const HEIGHT = 1920;
const DURATION = 2;

// Define the animation function first, before it's referenced
const animation: AnimationFunction = (
  p: p5,
  normalizedTime: number
  // frameNumber: number,
  // totalFrames: number
): void => {
  p.background(0);

  // Text "This is starter file" at the center of the canvas, centered horizontally and vertically
  p.textAlign(p.CENTER, p.CENTER);
  p.fill(255);
  p.textSize(100);
  p.text(
    "This is starter file",
    p.width / 2,
    p.height / 2 + 42 * Math.sin(Math.PI * 2 * normalizedTime)
  );
};

const setupAnimation: AnimationFunction = (p: p5): void => {
  p.background(0);
  p.frameRate(FPS);
};

// Now declare the settings after animation is defined
export const settings: AnimationSettings = {
  id: "default",
  name: "Default",

  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  totalFrames: DURATION * FPS,

  function: animation,
  onSetup: setupAnimation,
};
