import p5 from "p5";
import { AnimationFunction, AnimationSettings } from "@/types/animations";
import { FPS, CENTER, WIDTH, HEIGHT } from "./constants";
import { easeInOutElastic, easeInOutCubic } from "../../utils/easing";

const SCALE = 2.5;
const UNIT = WIDTH / (2 * SCALE);

let TrailGraphics: p5.Graphics;

let prevLerpX = 0;
let prevLerpY = 0;

const R1 = UNIT * 4;
const R2 = UNIT * 2;

const lines = [
  {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  },
];

/*
 * Starter Animation Template
 *
 * @param {object} p - p5 instance
 * @param {number} t - normalized total time from 0 to 1
 * @param {number} frame - current frame number
 * @param {number} totalFrames - total number of frames in the video
 */
export const animation: AnimationFunction = (
  p: p5,
  normalizedTime: number,
  frameNumber: number,
  totalFrames: number
) => {
  // Clear the canvas to prevent flickering
  p.background(0);
  // TrailGraphics.clear();

  p.push();
  p.noFill();
  p.strokeWeight(4);
  p.stroke(20, 20, 20, 255);
  p.circle(CENTER.x, CENTER.y, R1);
  p.circle(CENTER.x, CENTER.y, R2);
  p.pop();

  const globalAngle = p.map(normalizedTime, 0, 1, 0, 2 * p.PI);

  const x1 = CENTER.x + (R1 / 2) * p.cos(globalAngle * 3 - p.PI / 2);
  const y1 = CENTER.y + (R1 / 2) * p.sin(globalAngle * 3 - p.PI / 2);
  const x2 = CENTER.x + (R2 / 2) * p.cos(globalAngle * 2 - p.PI / 2);
  const y2 = CENTER.y + (R2 / 2) * p.sin(globalAngle * 2 - p.PI / 2);

  p.push();
  p.noFill();
  p.strokeWeight(4);
  p.stroke(120, 120, 120, 255);
  p.line(x1, y1, x2, y2);
  p.pop();

  const sineNormalTime = p.map(
    p.sin(normalizedTime * p.PI * 2 + p.PI / 2),
    -1,
    1,
    0,
    1
  );

  const lerpX = p.lerp(x1, x2, easeInOutCubic(sineNormalTime));
  const lerpY = p.lerp(y1, y2, easeInOutCubic(sineNormalTime));

  p.push();
  p.noStroke();
  p.fill(255, 255, 255, 255);
  p.circle(lerpX, lerpY, 10);
  p.pop();

  if (prevLerpX !== 0 && prevLerpY !== 0) {
    lines.push({
      x1: prevLerpX,
      y1: prevLerpY,
      x2: lerpX,
      y2: lerpY,
    });
  }

  prevLerpX = lerpX;
  prevLerpY = lerpY;

  for (const line of lines) {
    p.push();
    p.stroke(255, 255, 255, 255);
    p.strokeWeight(2);
    p.line(line.x1, line.y1, line.x2, line.y2);
    p.pop();
  }
};

export const setupAnimation: AnimationFunction = (p: p5) => {
  // Setup code here
  p.background(0);
  p.frameRate(FPS);

  TrailGraphics = p.createGraphics(WIDTH, HEIGHT);
};
