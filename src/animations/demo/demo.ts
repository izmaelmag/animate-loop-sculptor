import p5 from "p5";
import { AnimationSettings, P5AnimationFunction, FrameContext } from "../../types/animations";
import { Point } from "../../utils/Point";
import { Color } from "../../utils/Color";
import { createGrid } from "./createGrid";

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 60;

const SCALE = 1.5;
const GRID_UNIT_SIZE = WIDTH / (2 * SCALE);

const CENTER = { x: WIDTH / 2, y: HEIGHT / 2 };

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

a.moveTo([b.x, b.y], 90, 60);
b.moveTo([a.x, a.y], 90, 60);
b.moveTo([a.x + GRID_UNIT_SIZE / 2, a.y - GRID_UNIT_SIZE], 180, 60);
b.moveTo([a.x, a.y], 250, 60);

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

const draw: P5AnimationFunction = (p: p5, ctx: FrameContext): void => {
  p.frameRate(FPS);
  stepper(ctx.currentFrame);
  p.background(0);

  p.image(
    createGrid(
      p,
      ctx.currentFrame,
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
    0, 0, p.width, p.height
  );

  p.push();
  p.stroke(curveColor.p5Color(p));
  p.noFill();
  p.strokeWeight(8);
  p.bezier(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y);
  p.pop();

  p.push();
  const R = 32;
  p.fill(pointColor.p5Color(p));
  p.noStroke();
  p.ellipse(a.x, a.y, R, R);
  p.ellipse(b.x, b.y, R, R);
  p.ellipse(c.x, c.y, R, R);
  p.ellipse(d.x, d.y, R, R);
  p.pop();

  p.push();
  p.stroke(lineColor.p5Color(p));
  p.strokeWeight(2);
  p.strokeCap(p.PROJECT);
  p.line(a.x, a.y, b.x, b.y);
  p.line(c.x, c.y, d.x, d.y);
  p.pop();
};

const setup = (p: p5): void => {
  p.background(0);
  p.frameRate(FPS);
};

export const settings: AnimationSettings = {
  name: "🎨 Demo",
  id: "demo",
  renderer: "p5",
  fps: FPS,
  totalFrames: FPS * 8,
  width: WIDTH,
  height: HEIGHT,
  draw,
  setup,
};
