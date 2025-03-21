import { AnimationSettings, AnimationFunction } from "@/types/animations";
import p5 from "p5";
import {
  RenderCallbackParams,
  renderTimelineLayer,
} from "../utils/renderTimelineLayer";
import { easeOutBounce } from "../utils/easing";

// let layer1: p5.Graphics;

// Define the animation function first, before it's referenced
const animation: AnimationFunction = (
  p: p5,
  normalizedTime: number,
  frameNumber: number,
  totalFrames: number
): void => {
  p.background(0);

  const layer1 = renderTimelineLayer(
    {
      p,
      frames: [0, 20],
      globalCurrentFrame: frameNumber,
      transparent: true,
    },
    ({ graphics, progress }) => {
      const circleRadius = 400 * easeOutBounce(progress);
      graphics.ellipse(p.width / 2, p.height / 2, circleRadius, circleRadius);
    }
  );

  // Reverse the circle to zero radius
  const layer2 = renderTimelineLayer(
    {
      p,
      frames: [20, 100],
      globalCurrentFrame: frameNumber,
      transparent: true,
    },
    ({ graphics, progress }) => {
      const circleRadius = 400 * easeOutBounce(1 - progress);
      graphics.ellipse(p.width / 2, p.height / 2, circleRadius, circleRadius);
    }
  );

  p.image(layer1, 0, 0, p.width, p.height);
  p.image(layer2, 0, 0, p.width, p.height);
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
  fps: 60,
  totalFrames: 1200,
  width: 1080,
  height: 1920,
  sequential: true,
  function: animation,
  onSetup: setupAnimation,
};
