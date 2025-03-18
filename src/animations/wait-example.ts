import { AnimationSettings, AnimationFunction } from "@/types/animations";
import p5 from "p5";
import { waitUntilFrame } from "../utils/timing";

// Define the animation function first, before it's referenced
const animation: AnimationFunction = (
  p: p5,
  normalizedTime: number,
  frameNumber: number,
  totalFrames: number
): void => {
  p.background(0);
  p.fill(255);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(96);
  
  if (waitUntilFrame(0, frameNumber)) {
    p.background(0);
    p.text("0", p.width / 2, p.height / 2);
  }

  if (waitUntilFrame(60, frameNumber)) {
    p.background(0);
    p.text("1", p.width / 2, p.height / 2);
  }

  if (waitUntilFrame(120, frameNumber)) {
    p.background(0);
    p.text("2", p.width / 2, p.height / 2);
  }

  if (waitUntilFrame(180, frameNumber)) {
    p.background(0);
    p.text("3", p.width / 2, p.height / 2);
  }

  if (waitUntilFrame(240, frameNumber)) {
    p.background(0);
    p.text("4", p.width / 2, p.height / 2);
  }
};

function setupAnimation(p: p5): void {
  p.background(0);
  p.fill(255);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(24);
}

// Now declare the settings after animation is defined
export const settings: AnimationSettings = {
  name: "Wait Example",
  id: "waitExample",
  duration: 20,
  fps: 60,
  totalFrames: 1200,
  width: 1080,
  height: 1920,
  sequential: true,
  function: animation,
  onSetup: setupAnimation,
};
