import p5 from "p5";
import { AnimationSettings, AnimationFunction } from "@/types/animations";

// Relative path required for remotion node environment
import { Point } from "../../utils/Point";
import { Color } from "../../utils/Color";
import { createGrid } from "./createGrid";

const WIDTH = 1080;
const HEIGHT = 1920;

const SCALE = 1.5;
const GRID_UNIT_SIZE = WIDTH / (2 * SCALE);

// Define the coordinate system center
const CENTER = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
};

// Define the grid's center (where 0,0 will be in the coordinate system)
// To place origin at top-left, use [0, 0]
let gridGraphics: p5.Image;
const GRID_CENTER: [number, number] = [CENTER.x, CENTER.y];

const a = new Point(CENTER.x - GRID_UNIT_SIZE, CENTER.y - GRID_UNIT_SIZE);
const b = new Point(CENTER.x + GRID_UNIT_SIZE, CENTER.y - GRID_UNIT_SIZE);
const c = new Point(CENTER.x - GRID_UNIT_SIZE, CENTER.y + GRID_UNIT_SIZE);
const d = new Point(CENTER.x + GRID_UNIT_SIZE, CENTER.y + GRID_UNIT_SIZE);

const pointColor = new Color("rgba(255, 255, 255, 0)");
const lineColor = new Color("rgba(255, 255, 255, 0)");
const curveColor = new Color("rgba(255, 255, 255, 0)");
const gridColor = new Color("rgba(255, 255, 255, 0)");

pointColor.changeTo("rgba(255, 255, 255, 1)", 0, 10);
lineColor.changeTo("rgba(255, 255, 255, 1)", 5, 10);
curveColor.changeTo("rgba(255, 255, 255, 1)", 10, 10);
gridColor.changeTo("rgba(255, 255, 255, 1)", 0, 20);

// Flips a and b
a.moveTo([b.x, b.y], 90, 60);
b.moveTo([a.x, a.y], 90, 60);

b.moveTo([a.x + GRID_UNIT_SIZE / 2, a.y - GRID_UNIT_SIZE], 180, 60);
b.moveTo([a.x, a.y], 250, 60);

// Flips c and d
c.moveTo([d.x, d.y], 120, 60);
d.moveTo([c.x, c.y], 120, 60);

c.moveTo([d.x, d.y + GRID_UNIT_SIZE / 2], 210, 60);
c.moveTo([d.x, d.y], 270, 60);

pointColor.changeTo("rgba(255, 255, 255, 0)", 360, 60);
lineColor.changeTo("rgba(255, 255, 255, 0)", 360, 60);
curveColor.changeTo("rgba(255, 255, 255, 0)", 360, 60);
gridColor.changeTo("rgba(255, 255, 255, 0)", 360, 60);

function stepper(frameNumber: number): void {
  a.step(frameNumber);
  b.step(frameNumber);
  c.step(frameNumber);
  d.step(frameNumber);

  pointColor.step(frameNumber);
  lineColor.step(frameNumber);
  curveColor.step(frameNumber);
  gridColor.step(frameNumber);
}

let UNIT_SIZE = WIDTH / (2 * SCALE);
// Define the animation function first, before it's referenced
const animation: AnimationFunction = (
  p: p5,
  normalizedTime: number,
  frameNumber: number,
  totalFrames: number
): void => {
  p.frameRate(60);

  UNIT_SIZE = WIDTH / (2 * SCALE);

  stepper(frameNumber);

  p.background(0);

  p.image(
    createGrid(
      p,
      frameNumber,
      {
        mainColor: gridColor.hexString,
        mainOpacity: gridColor.a - 0.6,
        secondaryColor: gridColor.hexString,
        secondaryOpacity: gridColor.a - 0.7,
        subgridColor: gridColor.hexString,
        subgridOpacity: gridColor.a - 0.8,
      },
      SCALE,
      GRID_CENTER
    ),
    0,
    0,
    p.width,
    p.height
  );

  // Draws a 8px bezier curve with p5 based on abcd points from kfManager
  p.push();
  p.stroke(curveColor.p5Color(p));
  p.noFill();
  p.strokeWeight(8);
  p.bezier(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y);
  p.pop();

  // Draws white points with radius 16 at abcd points
  p.push();
  const R = 32;
  p.fill(pointColor.p5Color(p));
  p.noStroke();
  p.ellipse(a.x, a.y, R, R);
  p.ellipse(b.x, b.y, R, R);
  p.ellipse(c.x, c.y, R, R);
  p.ellipse(d.x, d.y, R, R);
  p.pop();

  // Draws dashed lines ab and cd
  p.push();
  p.stroke(lineColor.p5Color(p));
  p.strokeWeight(2);
  p.strokeCap(p.PROJECT);
  p.line(a.x, a.y, b.x, b.y);
  p.line(c.x, c.y, d.x, d.y);
  p.pop();
};

function setupAnimation(p: p5): void {
  p.background(0);
  p.frameRate(60);
}

// Now declare the settings after animation is defined
export const settings: AnimationSettings = {
  name: "Demo",
  id: "demo",
  fps: 60,
  totalFrames: 60 * 8,
  width: WIDTH,
  height: HEIGHT,
  sequential: false,
  function: animation,
  onSetup: setupAnimation,
};
