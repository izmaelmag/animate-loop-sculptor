import p5 from "p5";
import { AnimationSettings, AnimationFunction } from "@/types/animations";

// Relative path required for remotion node environment
import { renderGrid, GridOptions } from "../../utils/renderGrid";
import { KFManager } from "../../blueprints/KeyframeManager";
import { easeInOutCubic, easeOutElastic } from "../../utils/easing";

const WIDTH = 1080;
const HEIGHT = 1920;

let gridGraphics: p5.Image;

const SCALE = 3.5;

const CENTER = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
};

function createGrid(
  p: p5,
  currentFrame: number,
  overrides: Partial<GridOptions> = {}
): p5.Image {
  return renderGrid({
    p,
    scale: SCALE,
    invertY: false,
    invertX: false,

    showMain: true,
    mainColor: "#aaaaaa",
    mainOpacity: 1,
    mainWidth: 3, // Increased line width for better visibility

    showSecondary: true,
    secondaryColor: "#444444",
    secondaryOpacity: 0.9,
    secondaryWidth: 3,

    showTicks: false,
    showUnits: true,
    textSize: 24, // Increased text size for better visibility

    subgrid: 2,
    subgridColor: "#444444",
    subgridOpacity: 0.7,
    subgridWidth: 1,

    animated: false,
    animationFramesLength: 60,
    currentGlobalFrame: currentFrame,
    stagger: 1,
    delay: 0,

    ...overrides,
  });
}

const kfManager = new KFManager({
  p1x: CENTER.x,
  p1y: CENTER.y,
  p2x: CENTER.x,
  p2y: CENTER.y,
  scale: 4.5,
});

let UNIT_SIZE = WIDTH / (2 * SCALE);

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

kfManager.createSequence("scale", [
  { frame: 0, value: 4.5, easingFn: easeOutElastic },
  { frame: 120, value: 2, easingFn: easeOutElastic },
  { frame: 320, value: 4.5, easingFn: easeOutElastic },
]);

// Define the animation function first, before it's referenced
const animation: AnimationFunction = (
  p: p5,
  normalizedTime: number,
  frameNumber: number,
  totalFrames: number
): void => {
  // Update animation values based on current frame
  const { p1x, p1y, p2x, p2y, scale } = kfManager.animate(frameNumber);

  p.frameRate(24);

  UNIT_SIZE = WIDTH / (2 * scale);

  p.background(0);

  p.image(createGrid(p, frameNumber), 0, 0, p.width, p.height);

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
  p.circle(p1x, CENTER.y, 12);
  p.circle(CENTER.x, p1y, 12);
  p.circle(p2x, CENTER.y, 12);
  p.circle(CENTER.x, p2y, 12);
  p.pop();
};

function setupAnimation(p: p5): void {
  p.background(0);
}

// Now declare the settings after animation is defined
export const lerpMoveIntro: AnimationSettings = {
  name: "Demo",
  id: "demo",
  fps: 60,
  totalFrames: 60 * 20,
  width: WIDTH,
  height: HEIGHT,
  sequential: false,
  function: animation,
  onSetup: setupAnimation,
};
