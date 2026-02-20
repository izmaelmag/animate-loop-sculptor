import p5 from "p5";
import {
  AnimationSettings,
  P5AnimationFunction,
  FrameContext,
} from "../../types/animations";
import { DynamicSegments, Point } from "../../utils/DynamicSegments";
import { defaultParams, resolveDynamicStripesParams } from "./settings";
import { createDynamicStripesParamsPane } from "./createParamsPane";

const FPS = 60;
const WIDTH = 1080;
const HEIGHT = 1920;
const DURATION_SECONDS = 15;
const TOTAL_FRAMES = FPS * DURATION_SECONDS;
const LINE_PHASE_STEP = 0.2;

interface DiagonalLine {
  a: Point;
  b: Point;
  phaseOrder: number;
}

interface RectBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const buildRectBounds = (margin: number): RectBounds => {
  const minMargin = -Math.max(WIDTH, HEIGHT);
  const maxMarginX = Math.max(0, WIDTH / 2 - 1);
  const maxMarginY = Math.max(0, HEIGHT / 2 - 1);
  const maxMargin = Math.min(maxMarginX, maxMarginY);
  const clampedMargin = Math.min(Math.max(minMargin, margin), maxMargin);

  return {
    left: clampedMargin,
    top: clampedMargin,
    right: WIDTH - clampedMargin,
    bottom: HEIGHT - clampedMargin,
  };
};

const buildDiagonalLines = (
  edgeDivisions: number,
  bounds: RectBounds,
): DiagonalLine[] => {
  const divisions = Math.max(1, Math.round(edgeDivisions));
  const rectWidth = bounds.right - bounds.left;
  const rectHeight = bounds.bottom - bounds.top;
  const diagonalLines: DiagonalLine[] = [];
  const maxOrder = divisions - 1;

  // Top -> Right family. We reverse order so the phase starts near top-right.
  for (let step = 0; step <= divisions; step += 1) {
    const t = step / divisions;
    const offsetX = rectWidth * t;
    const offsetY = rectHeight * t;
    const ax = bounds.left + offsetX;
    const ay = bounds.top;
    const bx = bounds.right;
    const by = bounds.bottom - offsetY;

    if (Math.abs(ax - bx) < 1e-6 && Math.abs(ay - by) < 1e-6) {
      continue;
    }

    diagonalLines.push({
      a: [ax, ay],
      b: [bx, by],
      phaseOrder: maxOrder - step,
    });
  }

  // Left -> Bottom family continues the same phase order toward bottom-left.
  for (let step = 1; step <= divisions; step += 1) {
    const t = step / divisions;
    const offsetX = rectWidth * t;
    const offsetY = rectHeight * t;
    const ax = bounds.left;
    const ay = bounds.top + offsetY;
    const bx = bounds.right - offsetX;
    const by = bounds.bottom;

    if (Math.abs(ax - bx) < 1e-6 && Math.abs(ay - by) < 1e-6) {
      continue;
    }

    diagonalLines.push({
      a: [ax, ay],
      b: [bx, by],
      phaseOrder: maxOrder + step,
    });
  }

  return diagonalLines;
};

const dynamicSegments = new DynamicSegments(
  [defaultParams.margin, defaultParams.margin],
  [WIDTH - defaultParams.margin, HEIGHT - defaultParams.margin],
  {
    segmentCount: defaultParams.segmentCount,
    gap: defaultParams.segmentGap,
  },
);

const draw: P5AnimationFunction = (p: p5, ctx: FrameContext): void => {
  const params = resolveDynamicStripesParams(ctx.params);
  const bounds = buildRectBounds(params.margin);
  const diagonalLines = buildDiagonalLines(params.edgeDivisions, bounds);
  const totalFrames = Math.max(1, ctx.totalFrames);
  const loopFrame =
    ((ctx.currentFrame % totalFrames) + totalFrames) % totalFrames;
  const loopT = loopFrame / totalFrames;
  const baseTimePhase = loopT * Math.PI * 2 * params.speed;
  const directionSign = params.waveDirection === "tr-bl" ? 1 : -1;

  p.background(0);
  p.noFill();
  p.stroke(255);
  p.strokeWeight(params.lineThickness);
  p.strokeCap(p.ROUND);

  for (let lineIndex = 0; lineIndex < diagonalLines.length; lineIndex += 1) {
    const { a: lineA, b: lineB, phaseOrder } = diagonalLines[lineIndex];
    dynamicSegments.setPoints(lineA, lineB);
    dynamicSegments.setSegmentCount(params.segmentCount);
    dynamicSegments.setGap(params.segmentGap);

    const deltas = dynamicSegments.splitPoints.map((_, pointIndex) => {
      const phase =
        baseTimePhase +
        pointIndex * params.phaseDelta +
        directionSign * phaseOrder * LINE_PHASE_STEP;
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
