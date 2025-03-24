import p5 from "p5";
import { AnimationSettings, AnimationFunction } from "@/types/animations";

// Relative path required for remotion node environment
import { renderGrid, GridOptions } from "../../utils/renderGrid";
import { KFManager } from "../../blueprints/KeyframeManager";
import { easeInOutCirc, easeOutElastic } from "../../utils/easing";

import { Line } from "../../utils/Line";

const WIDTH = 1080;
const HEIGHT = 1920;

let gridGraphics: p5.Image;

const SCALE = 3.5;
const GRID_UNIT_SIZE = WIDTH / (2 * SCALE);

// Define the coordinate system center
const CENTER = {
  x: GRID_UNIT_SIZE,
  y: HEIGHT / 2,
};

// Define the grid's center (where 0,0 will be in the coordinate system)
// To place origin at top-left, use [0, 0]
const GRID_CENTER: [number, number] = [CENTER.x, CENTER.y];

function createGrid(
  p: p5,
  currentFrame: number,
  overrides: Partial<GridOptions> = {}
): p5.Image {
  return renderGrid({
    p,
    scale: SCALE,
    invertY: true,
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
    showUnits: false,
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

const startManagerState = {
  a: {
    x: CENTER.x,
    y: CENTER.y,
    r: 0,
  },
  b: {
    x: CENTER.x + GRID_UNIT_SIZE * 5,
    y: CENTER.y,
    r: 0,
  },
  scale: 4.5,
};

const kfManager = new KFManager(startManagerState);

const line = new Line(
  [startManagerState.a.x, startManagerState.a.y],
  [startManagerState.b.x, startManagerState.b.y]
);

kfManager.createSequence("a.r", [
  { frame: 30, value: 0, easingFn: easeOutElastic },
  { frame: 60, value: 42, easingFn: easeOutElastic },
]);

kfManager.createSequence("b.r", [
  { frame: 50, value: 0, easingFn: easeOutElastic },
  { frame: 80, value: 42, easingFn: easeOutElastic },
]);

line.setEasing(easeInOutCirc);
line.connection(80, 100);

let UNIT_SIZE = WIDTH / (2 * SCALE);
// Define the animation function first, before it's referenced
const animation: AnimationFunction = (
  p: p5,
  normalizedTime: number,
  frameNumber: number,
  totalFrames: number
): void => {
  // Update animation values based on current frame
  const { a, b } = kfManager.animate(frameNumber);

  p.frameRate(24);

  UNIT_SIZE = WIDTH / (2 * SCALE);

  p.background(0);

  line.step(frameNumber);

  p.image(createGrid(p, frameNumber), 0, 0, p.width, p.height);

  console.log(a, b);

  p.push();
  p.stroke(255, 255, 255);
  p.strokeWeight(8);
  p.line(line.a[0], line.a[1], line.current[0], line.current[1]);
  p.pop();

  p.push();
  p.stroke(0, 0, 0);
  p.fill(255, 120, 120);
  p.strokeWeight(8);
  p.circle(a.x, a.y, a.r);
  p.circle(b.x, b.y, b.r);
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
