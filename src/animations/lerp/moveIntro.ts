import { AnimationSettings, AnimationFunction } from "@/types/animations";
import { renderGrid } from "../../utils/renderGrid";
import p5 from "p5";
import { KF } from "../../utils/kf";
import { easeInOutSine } from "../../utils/easing";

const WIDTH = 1080;
const HEIGHT = 1920;

let gridGraphics: p5.Image;

const SCALE = 3.5;
const UNIT_SIZE = WIDTH / (2 * SCALE);

const CENTER = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
};

const GEOMETRY_STORE = {
  p1: {
    x: CENTER.x + UNIT_SIZE,
    y: CENTER.y + UNIT_SIZE,
    r: 32,
    kfx: null,
    kfy: null,
  },
  p2: {
    x: CENTER.x - UNIT_SIZE,
    y: CENTER.y - UNIT_SIZE,
    r: 32,
    kfx: null,
    kfy: null,
  },
  sequences: [],
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

function setupStore() {
  const { p1, p2 } = GEOMETRY_STORE;

  p1.kfx = new KF(p1, "x");
  p1.kfy = new KF(p1, "y");

  p2.kfx = new KF(p2, "x");
  p2.kfy = new KF(p2, "y");

  GEOMETRY_STORE.sequences = [
    p1.kfx
      .startAt(p1.x)
      .next(120, easeInOutSine, { delay: 0, length: 120 })
      .next(120, easeInOutSine, { delay: 0, length: 120 }),

    p1.kfy
      .startAt(p1.y)
      .next(120, easeInOutSine, { delay: 0, length: 120 })
      .next(120, easeInOutSine, { delay: 0, length: 120 }),
  ];

  console.log(GEOMETRY_STORE.sequences);
}

// Define the animation function first, before it's referenced
const animation: AnimationFunction = (
  p: p5,
  normalizedTime: number,
  frameNumber: number,
  totalFrames: number
): void => {
  p.background(0);

  const { p1, p2, sequences } = GEOMETRY_STORE;

  console.log(sequences);
  sequences.forEach((sequence) => {
    console.log(frameNumber);
    sequence.animate(frameNumber);
  });

  if (frameNumber < 1200) {
    updateGrid(p, frameNumber);
  }

  if (gridGraphics) {
    p.image(gridGraphics, 0, 0, p.width, p.height);
  }

  p.push();
  p.stroke(0, 0, 0);
  p.strokeWeight(12);
  p.line(p1.x, p1.y, p2.x, p2.y);
  p.stroke(120, 255, 200);
  p.strokeWeight(4);
  p.line(p1.x, p1.y, p2.x, p2.y);
  p.pop();

  // white dashed line from point A to X projections
  p.push();
  p.stroke(255, 120, 255);
  p.strokeWeight(2);
  p.strokeCap(p.PROJECT);
  p.drawingContext.setLineDash([10, 10]);
  p.line(p1.x, p1.y, p1.x, CENTER.y);
  p.line(p1.x, p1.y, CENTER.x, p1.y);
  p.line(p2.x, p2.y, p2.x, CENTER.y);
  p.line(p2.x, p2.y, CENTER.x, p2.y);
  p.pop();

  p.push();
  p.stroke(0, 0, 0);
  p.strokeWeight(8);
  p.fill(255, 255, 255);
  p.circle(p1.x, p1.y, 32);
  p.circle(p2.x, p2.y, 32);
  p.pop();

  p.push();
  p.stroke(0, 0, 0);
  p.strokeWeight(4);
  p.fill(255, 120, 255);
  p.circle(p1.x, CENTER.y, 18);
  p.circle(CENTER.x, p1.y, 18);
  p.circle(p2.x, CENTER.y, 18);
  p.circle(CENTER.x, p2.y, 18);
  p.pop();
};

function setupAnimation(p: p5): void {
  p.background(0);
  setupStore();
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
