import { AnimationSettings, AnimationFunction } from "@/types/animations";
import { renderGrid } from "../../utils/renderGrid";
import p5 from "p5";
import { KFManager } from "../../blueprints/KeyframeManager";
import { easeInOutCubic } from "../../utils/easing";

const WIDTH = 1080;
const HEIGHT = 1920;

let gridGraphics: p5.Image;

const SCALE = 3.5;
const UNIT_SIZE = WIDTH / (2 * SCALE);

const CENTER = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
};

function updateGrid(p: p5, currentFrame: number): void {
  gridGraphics = renderGrid({
    p,
    scale: SCALE,
    showMain: true,
    showSecondary: true,
    showUnits: true,
    showTicks: false,
    invertY: false,
    invertX: false,
    mainColor: "#aaaaaa",
    secondaryColor: "#444444",
    mainOpacity: 1,
    secondaryOpacity: 0.9,
    mainWidth: 3, // Increased line width for better visibility
    secondaryWidth: 3,
    textSize: 24, // Increased text size for better visibility
    // animation
    subgrid: 2,
    subgridColor: "#444444",
    subgridOpacity: 0.7,
    subgridWidth: 1,
    animated: false,
    animationFramesLength: 60,
    currentGlobalFrame: currentFrame,
    stagger: 1,
    delay: 0,
  });
}

const INITIAL_STORE = {
  p1x: CENTER.x,
  p1y: CENTER.y,
  p2x: CENTER.x,
  p2y: CENTER.y,
};

const kfManager = new KFManager(INITIAL_STORE);

kfManager.createSequence("p1x", [
  { frame: 0, value: CENTER.x + UNIT_SIZE, easingFn: easeInOutCubic },
  { frame: 120, value: CENTER.x - UNIT_SIZE, easingFn: easeInOutCubic },
]);

kfManager.createSequence("p1y", [
  { frame: 0, value: CENTER.y + UNIT_SIZE, easingFn: easeInOutCubic },
  { frame: 120, value: CENTER.y - UNIT_SIZE, easingFn: easeInOutCubic },
]);

kfManager.createSequence("p2x", [
  { frame: 0, value: CENTER.x - UNIT_SIZE, easingFn: easeInOutCubic },
  { frame: 120, value: CENTER.x + UNIT_SIZE, easingFn: easeInOutCubic },
]);

kfManager.createSequence("p2y", [
  { frame: 0, value: CENTER.y - UNIT_SIZE, easingFn: easeInOutCubic },
  { frame: 120, value: CENTER.y + UNIT_SIZE, easingFn: easeInOutCubic },
]);

// Define the animation function first, before it's referenced
const animation: AnimationFunction = (
  p: p5,
  normalizedTime: number,
  frameNumber: number,
  totalFrames: number
): void => {
  p.background(0);

  // Update animation values based on current frame
  kfManager.animate(frameNumber);

  console.log(kfManager.store);
  console.log(frameNumber);

  const { p1x, p1y, p2x, p2y } = kfManager.store;

  console.log(p1x, p1y, p2x, p2y);

  if (frameNumber < 1200) {
    updateGrid(p, frameNumber);
  }

  if (gridGraphics) {
    p.image(gridGraphics, 0, 0, p.width, p.height);
  }

  p.push();
  p.stroke(0, 0, 0);
  p.strokeWeight(12);
  p.line(p1x, p1y, p2x, p2y);
  p.stroke(120, 255, 200);
  p.strokeWeight(4);
  p.line(p1x, p1y, p2x, p2y);
  p.pop();

  // white dashed line from point A to X projections
  p.push();
  p.stroke(255, 120, 255);
  p.strokeWeight(2);
  p.strokeCap(p.PROJECT);
  p.drawingContext.setLineDash([10, 10]);
  p.line(p1x, p1y, p1x, CENTER.y);
  p.line(p1x, p1y, CENTER.x, p1y);
  p.line(p2x, p2y, p2x, CENTER.y);
  p.line(p2x, p2y, CENTER.x, p2y);
  p.pop();

  p.push();
  p.stroke(0, 0, 0);
  p.strokeWeight(8);
  p.fill(255, 255, 255);
  p.circle(p1x, p1y, 32);
  p.circle(p2x, p2y, 32);
  p.pop();

  p.push();
  p.stroke(0, 0, 0);
  p.strokeWeight(4);
  p.fill(255, 120, 255);
  p.circle(p1x, CENTER.y, 18);
  p.circle(CENTER.x, p1y, 18);
  p.circle(p2x, CENTER.y, 18);
  p.circle(CENTER.x, p2y, 18);
  p.pop();
};

function setupAnimation(p: p5): void {
  p.background(0);
}

// Now declare the settings after animation is defined
export const lerpMoveIntro: AnimationSettings = {
  name: "LERP Move Intro",
  id: "lerpMoveIntro",
  fps: 60,
  totalFrames: 60 * 6,
  width: WIDTH,
  height: HEIGHT,
  sequential: false,
  function: animation,
  onSetup: setupAnimation,
};
