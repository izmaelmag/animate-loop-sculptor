import p5 from "p5";
import { P5AnimationFunction, FrameContext } from "../../types/animations";
import { FPS, CENTER, WIDTH, HEIGHT, TOTAL_FRAMES } from "./constants";
import { easeInOutCubic } from "../../utils/easing";
import { createGrid } from "./createGrid";
import { Numset } from "../../utils/Numset";

const SCALE = 2.5;
const UNIT = WIDTH / (2 * SCALE);

let TrailGraphics: p5.Graphics;

const R1 = UNIT * 4;
const R2 = UNIT * 2;

const numset = new Numset([0, 0, 255]);

numset.change([255, 0, 255], 30, 20);
numset.change([255, 255, 255], 50, 20);
numset.change([0, 255, 255], TOTAL_FRAMES / 2, 60);
numset.change([0, 255, 0], TOTAL_FRAMES / 2 + 60, 90);
numset.change([0, 0, 0], TOTAL_FRAMES / 2 + 180, 60);

export const animation: P5AnimationFunction = (p: p5, ctx: FrameContext) => {
  const { currentFrame: frameNumber, totalFrames } = ctx;

  p.background(0);

  let lastX: number | null = null;
  let lastY: number | null = null;

  numset.step(frameNumber);

  p.image(
    createGrid(
      p,
      frameNumber,
      {
        mainOpacity: numset.values.at(2) / 255,
        secondaryOpacity: numset.values.at(2) / 255,
        subgridOpacity: numset.values.at(2) / 255,
      },
      SCALE,
      [CENTER.x, CENTER.y]
    ),
    0, 0
  );

  p.push();
  p.stroke(100, 100, 100, numset.values.at(0));
  p.strokeWeight(2);
  p.noFill();
  p.circle(CENTER.x, CENTER.y, R1);
  p.circle(CENTER.x, CENTER.y, R2);
  p.pop();

  const tNorm = frameNumber / totalFrames;
  let buildProgress = Math.min(tNorm * 2, 1);
  const maxFrame = Math.floor(buildProgress * totalFrames);

  for (let f = 0; f <= maxFrame; f++) {
    const t = easeInOutCubic(f / totalFrames);
    const angle = p.map(t, 0, 1, 0, 2 * p.PI);

    const x1 = CENTER.x + (R1 / 2) * p.cos(angle * 3 - p.PI / 2);
    const y1 = CENTER.y + (R1 / 2) * p.sin(angle * 3 - p.PI / 2);
    const x2 = CENTER.x + (R2 / 2) * p.cos(angle * 2 - p.PI / 2);
    const y2 = CENTER.y + (R2 / 2) * p.sin(angle * 2 - p.PI / 2);

    const sineT = p.map(p.sin(t * p.PI * 2 + p.PI / 2), -1, 1, 0, 1);
    const interpX = p.lerp(x1, x2, easeInOutCubic(sineT));
    const interpY = p.lerp(y1, y2, easeInOutCubic(sineT));

    if (lastX !== null && lastY !== null) {
      p.push();
      p.stroke(255, 255, 255, numset.values.at(1));
      p.strokeWeight(2);
      p.line(lastX, lastY, interpX, interpY);
      p.pop();
    }

    lastX = interpX;
    lastY = interpY;
  }

  buildProgress = Math.min((frameNumber / totalFrames) * 2, 1);
  const t = easeInOutCubic(buildProgress);
  const angle = p.map(t, 0, 1, 0, 2 * p.PI);

  const x1 = CENTER.x + (R1 / 2) * p.cos(angle * 3 - p.PI / 2);
  const y1 = CENTER.y + (R1 / 2) * p.sin(angle * 3 - p.PI / 2);
  const x2 = CENTER.x + (R2 / 2) * p.cos(angle * 2 - p.PI / 2);
  const y2 = CENTER.y + (R2 / 2) * p.sin(angle * 2 - p.PI / 2);

  const sineT = p.map(p.sin(t * p.PI * 2 + p.PI / 2), -1, 1, 0, 1);
  const interpX = p.lerp(x1, x2, easeInOutCubic(sineT));
  const interpY = p.lerp(y1, y2, easeInOutCubic(sineT));

  p.push();
  p.fill(255, 100, 100, numset.values.at(0));
  p.noStroke();
  p.circle(x1, y1, 10);
  p.pop();

  p.push();
  p.fill(100, 100, 255, numset.values.at(0));
  p.noStroke();
  p.circle(x2, y2, 10);
  p.pop();

  p.push();
  p.stroke(120, 120, 255, numset.values.at(0));
  p.strokeWeight(2);
  p.line(x1, y1, x2, y2);
  p.pop();

  p.push();
  p.fill(255, 255, 255, numset.values.at(0));
  p.noStroke();
  p.circle(interpX, interpY, 10);
  p.pop();
};

export const setupAnimation = (p: p5): void => {
  p.background(0);
  p.frameRate(FPS);
  TrailGraphics = p.createGraphics(WIDTH, HEIGHT);
};
