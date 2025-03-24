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

// Define the coordinate system center
const CENTER = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
};

const GRID_UNIT_SIZE = WIDTH / (2 * SCALE);

// Define the grid's center (where 0,0 will be in the coordinate system)
// To place origin at top-left, use [0, 0]
const GRID_CENTER: [number, number] = [GRID_UNIT_SIZE, HEIGHT / 2];

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
    center: GRID_CENTER,

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

    animated: true,
    animationFramesLength: 60,
    currentGlobalFrame: currentFrame,
    stagger: 1,
    delay: 0,

    ...overrides,
  });
}

// Convert from grid coordinates to screen coordinates
// Helper function to translate between coordinate systems
function gridToScreen(x: number, y: number): [number, number] {
  const unitSize = WIDTH / (2 * SCALE);
  return [GRID_CENTER[0] + x * unitSize, GRID_CENTER[1] + y * unitSize];
}

const kfManager = new KFManager({
  p1x: 1,
  p1y: -1,
  p2x: -1,
  p2y: 1,
  scale: 4.5,
});

let UNIT_SIZE = WIDTH / (2 * SCALE);

kfManager.createSequence("p1x", [
  { frame: 0, value: 1, easingFn: easeInOutCubic },
  { frame: 120, value: -1, easingFn: easeInOutCubic },
]);

kfManager.createSequence("p1y", [
  { frame: 0, value: -1, easingFn: easeInOutCubic },
  { frame: 120, value: 1, easingFn: easeInOutCubic },
]);

kfManager.createSequence("p2x", [
  { frame: 0, value: -1, easingFn: easeInOutCubic },
  { frame: 120, value: 1, easingFn: easeInOutCubic },
]);

kfManager.createSequence("p2y", [
  { frame: 0, value: 1, easingFn: easeInOutCubic },
  { frame: 120, value: -1, easingFn: easeInOutCubic },
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

  // Convert from grid coordinates to screen coordinates
  const [screen_p1x, screen_p1y] = gridToScreen(p1x, p1y);
  const [screen_p2x, screen_p2y] = gridToScreen(p2x, p2y);
  const [screen_cx, screen_cy] = gridToScreen(0, 0);

  p.push();
  p.stroke(0, 0, 0);
  p.strokeWeight(12);
  p.line(screen_p1x, screen_p1y, screen_p2x, screen_p2y);
  p.stroke(120, 255, 200);
  p.strokeWeight(4);
  p.line(screen_p1x, screen_p1y, screen_p2x, screen_p2y);
  p.pop();

  // white dashed line from point A to X projections
  p.push();
  p.stroke(255, 120, 255);
  p.strokeWeight(2);
  p.strokeCap(p.PROJECT);
  p.drawingContext.setLineDash([10, 10]);
  p.line(screen_p1x, screen_p1y, screen_p1x, screen_cy);
  p.line(screen_p1x, screen_p1y, screen_cx, screen_p1y);
  p.line(screen_p2x, screen_p2y, screen_p2x, screen_cy);
  p.line(screen_p2x, screen_p2y, screen_cx, screen_p2y);
  p.pop();

  p.push();
  p.stroke(0, 0, 0);
  p.strokeWeight(8);
  p.fill(255, 255, 255);
  p.circle(screen_p1x, screen_p1y, 32);
  p.circle(screen_p2x, screen_p2y, 32);
  p.pop();

  p.push();
  p.stroke(0, 0, 0);
  p.strokeWeight(4);
  p.fill(255, 120, 255);
  p.circle(screen_p1x, screen_cy, 12);
  p.circle(screen_cx, screen_p1y, 12);
  p.circle(screen_p2x, screen_cy, 12);
  p.circle(screen_cx, screen_p2y, 12);
  p.pop();
};

function setupAnimation(p: p5): void {
  p.background(0);
}

// Now declare the settings after animation is defined
export const demo: AnimationSettings = {
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
