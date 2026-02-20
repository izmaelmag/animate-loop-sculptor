import p5 from "p5";
import {
  AnimationSettings,
  P5AnimationFunction,
  FrameContext,
} from "@/types/animations";
import { DynamicSegments, Point } from "@/utils/DynamicSegments";
import { defaultParams, resolveDynamicStripesParams } from "./settings";
import { createDynamicStripesParamsPane } from "./createParamsPane";

const FPS = 60;
const WIDTH = 1080;
const HEIGHT = 1080;
const DURATION_SECONDS = 15;
const TOTAL_FRAMES = FPS * DURATION_SECONDS;
const RECT_MIN = 0.1;
const RECT_MAX = 0.9;
const LINE_PHASE_STEP = 0.2;

const toPxPoint = (x: number, y: number): Point => [x * WIDTH, y * HEIGHT];

interface DiagonalLine {
  a: Point;
  b: Point;
  distanceFromCenter: number;
}

const buildDiagonalLines = (edgeDivisions: number): DiagonalLine[] => {
  const divisions = Math.max(1, Math.round(edgeDivisions));
  const rectSize = RECT_MAX - RECT_MIN;
  const diagonalLines: DiagonalLine[] = [];

  // Top -> Right family (includes the main diagonal at step 0).
  for (let step = 0; step <= divisions; step += 1) {
    const offset = (rectSize * step) / divisions;
    const ax = RECT_MIN + offset;
    const ay = RECT_MIN;
    const bx = RECT_MAX;
    const by = RECT_MAX - offset;

    if (Math.abs(ax - bx) < 1e-6 && Math.abs(ay - by) < 1e-6) {
      continue;
    }

    diagonalLines.push({
      a: toPxPoint(ax, ay),
      b: toPxPoint(bx, by),
      distanceFromCenter: step,
    });
  }

  // Left -> Bottom family (starts at step 1 to avoid duplicate main diagonal).
  for (let step = 1; step <= divisions; step += 1) {
    const offset = (rectSize * step) / divisions;
    const ax = RECT_MIN;
    const ay = RECT_MIN + offset;
    const bx = RECT_MAX - offset;
    const by = RECT_MAX;

    if (Math.abs(ax - bx) < 1e-6 && Math.abs(ay - by) < 1e-6) {
      continue;
    }

    diagonalLines.push({
      a: toPxPoint(ax, ay),
      b: toPxPoint(bx, by),
      distanceFromCenter: step,
    });
  }

  return diagonalLines;
};

const dynamicSegments = new DynamicSegments(
  toPxPoint(RECT_MIN, RECT_MIN),
  toPxPoint(RECT_MAX, RECT_MAX),
  {
    segmentCount: defaultParams.segmentCount,
    gap: defaultParams.segmentGap,
  },
);

const draw: P5AnimationFunction = (p: p5, ctx: FrameContext): void => {
  const params = resolveDynamicStripesParams(ctx.params);
  const diagonalLines = buildDiagonalLines(params.edgeDivisions);
  const totalFrames = Math.max(1, ctx.totalFrames);
  const loopFrame =
    ((ctx.currentFrame % totalFrames) + totalFrames) % totalFrames;
  const loopT = loopFrame / totalFrames;
  const baseTimePhase = loopT * Math.PI * 2 * params.speed;

  p.background(0);
  p.noFill();
  p.stroke(255);
  p.strokeWeight(params.lineThickness);
  p.strokeCap(p.ROUND);

  for (let lineIndex = 0; lineIndex < diagonalLines.length; lineIndex += 1) {
    const { a: lineA, b: lineB, distanceFromCenter } = diagonalLines[lineIndex];
    dynamicSegments.setPoints(lineA, lineB);
    dynamicSegments.setSegmentCount(params.segmentCount);
    dynamicSegments.setGap(params.segmentGap);

    const deltas = dynamicSegments.splitPoints.map((_, pointIndex) => {
      const phase =
        baseTimePhase +
        pointIndex * params.phaseDelta +
        distanceFromCenter * LINE_PHASE_STEP;
      return Math.sin(phase) * params.amplitude;
    });
    dynamicSegments.updateSplitPoints(deltas);

    const drawableSegments = dynamicSegments.getDrawableSegmentsPx();
    for (
      let segmentIndex = 0;
      segmentIndex < drawableSegments.length;
      segmentIndex += 1
    ) {
      const [[x1, y1], [x2, y2]] = drawableSegments[segmentIndex];
      p.line(x1, y1, x2, y2);
    }
  }
};

const setup = (p: p5): void => {
  p.background(0);
  p.frameRate(FPS);
};

export const settings: AnimationSettings = {
  id: "dynamicstripesdemo",
  name: "🎨 DynamicStripesDemo",
  renderer: "p5",
  fps: FPS,
  totalFrames: TOTAL_FRAMES,
  width: WIDTH,
  height: HEIGHT,
  defaultParams,
  createParamsPane: createDynamicStripesParamsPane,
  draw,
  setup,
};
