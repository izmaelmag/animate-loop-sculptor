import { AnimationSettings, AnimationFunction } from "@/types/animations";
import { renderGrid } from "../../utils/renderGrid";
import p5 from "p5";

let gridGraphics: p5.Image;

const SCALE = 2.2;
const UNIT_SIZE = 1080 / (2 * SCALE);

function updateGrid(p: p5, currentFrame: number): void {
  gridGraphics = renderGrid({
    p,
    scale: SCALE,
    showMain: true,
    showSecondary: true,
    showUnits: true,
    invertY: true,
    invertX: false,
    mainColor: "#aaaaaa",
    secondaryColor: "#444444",
    mainOpacity: 1,
    secondaryOpacity: 1,
    mainWidth: 3, // Increased line width for better visibility
    secondaryWidth: 3,
    textSize: 32, // Increased text size for better visibility
    // animation
    animated: true,
    animationFramesLength: 60,
    currentGlobalFrame: currentFrame,
    stagger: 2,
    delay: 30,
  });
}

function setupAnimation(p: p5): void {
  p.background(0);
}

// Define the animation function first, before it's referenced
const animation: AnimationFunction = (
  p: p5,
  normalizedTime: number,
  frameNumber: number,
  totalFrames: number
): void => {
  p.background(0);

  if (frameNumber < 120) {
    updateGrid(p, frameNumber);
  }

  if (gridGraphics) {
    p.image(gridGraphics, 0, 0, p.width, p.height);
  }
};

// Now declare the settings after animation is defined
export const lerpMoveIntro: AnimationSettings = {
  name: "LERP Move Intro",
  id: "lerpMoveIntro",
  fps: 60,
  totalFrames: 60 * 3,
  width: 1080,
  height: 1920,
  sequential: true,
  function: animation,
  onSetup: setupAnimation,
};
