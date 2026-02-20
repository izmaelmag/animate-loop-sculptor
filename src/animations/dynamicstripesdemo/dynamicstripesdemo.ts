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

interface LineSeed {
  a: Point;
  b: Point;
  projectionTRBL: number;
}

const buildParallelLines = (
  lineCountInput: number,
  lineAngleDeg: number,
  margin: number,
  lineLengthPx: number,
): DiagonalLine[] => {
  const lineCount = Math.max(1, Math.round(lineCountInput));
  const angleRad = (lineAngleDeg * Math.PI) / 180;
  const dir: Point = [Math.cos(angleRad), Math.sin(angleRad)];
  const normal: Point = [-dir[1], dir[0]];
  const center: Point = [WIDTH / 2, HEIGHT / 2];

  const projectionRadius =
    (Math.abs(normal[0]) * WIDTH + Math.abs(normal[1]) * HEIGHT) / 2;
  const spanAlongNormal = Math.max(0, projectionRadius - margin);
  const lineLength = Math.max(1, lineLengthPx);
  const halfLength = lineLength / 2;
  const seeds: LineSeed[] = [];

  for (let index = 0; index < lineCount; index += 1) {
    const t = lineCount === 1 ? 0.5 : index / (lineCount - 1);
    const offsetAlongNormal = -spanAlongNormal + 2 * spanAlongNormal * t;
    const cx = center[0] + normal[0] * offsetAlongNormal;
    const cy = center[1] + normal[1] * offsetAlongNormal;

    const a: Point = [cx - dir[0] * halfLength, cy - dir[1] * halfLength];
    const b: Point = [cx + dir[0] * halfLength, cy + dir[1] * halfLength];
    // Global axis for stable wave direction semantics.
    const projectionTRBL = cy - cx;

    seeds.push({ a, b, projectionTRBL });
  }

  seeds.sort((left, right) => left.projectionTRBL - right.projectionTRBL);
  return seeds.map((seed, phaseOrder) => ({
    a: seed.a,
    b: seed.b,
    phaseOrder,
  }));
};

const dynamicSegments = new DynamicSegments(
  [0, 0],
  [WIDTH, HEIGHT],
  {
    segmentCount: defaultParams.segmentCount,
    gap: defaultParams.segmentGap,
  },
);

const wrap01 = (value: number): number => {
  return ((value % 1) + 1) % 1;
};

const draw: P5AnimationFunction = (p: p5, ctx: FrameContext): void => {
  const params = resolveDynamicStripesParams(ctx.params);
  const diagonalLines = buildParallelLines(
    params.edgeDivisions,
    params.lineAngleDeg,
    params.margin,
    params.lineLengthPx,
  );
  const totalFrames = Math.max(1, ctx.totalFrames);
  const loopFrame =
    ((ctx.currentFrame % totalFrames) + totalFrames) % totalFrames;
  const loopT = loopFrame / totalFrames;
  const baseTimePhase = loopT * Math.PI * 2 * params.speed;
  const originOffset = wrap01(loopT * params.originSpeed);
  const directionSign = params.waveDirection === "tr-bl" ? 1 : -1;
  const strokeCapMode =
    params.strokeCap === "square"
      ? p.SQUARE
      : params.strokeCap === "project"
        ? p.PROJECT
        : p.ROUND;

  p.background(0);
  p.noFill();
  p.stroke(255);
  p.strokeWeight(params.lineThickness);
  p.strokeCap(strokeCapMode);

  for (let lineIndex = 0; lineIndex < diagonalLines.length; lineIndex += 1) {
    const { a: lineA, b: lineB, phaseOrder } = diagonalLines[lineIndex];
    dynamicSegments.setPoints(lineA, lineB);
    dynamicSegments.setSegmentCount(params.segmentCount);
    dynamicSegments.setGap(params.segmentGap);
    dynamicSegments.setMinSegmentLength(params.minSegmentLengthPx);
    dynamicSegments.setStrictGap(params.strictGap);

    const splitCount = Math.max(0, params.segmentCount - 1);
    const shiftedSplitPoints: number[] = [];

    for (let pointIndex = 0; pointIndex < splitCount; pointIndex += 1) {
      const basePoint = (pointIndex + 1) / params.segmentCount;
      const phase =
        baseTimePhase +
        pointIndex * params.phaseDelta +
        directionSign * phaseOrder * LINE_PHASE_STEP;
      const oscillation = Math.sin(phase) * params.amplitude;
      const movedBase = wrap01(basePoint + originOffset);
      shiftedSplitPoints.push(wrap01(movedBase + oscillation));
    }

    shiftedSplitPoints.sort((a, b) => a - b);
    dynamicSegments.setSplitPoints(shiftedSplitPoints);

    const drawableSegments = dynamicSegments.getDrawableSegmentsPx();
    for (
      let segmentIndex = 0;
      segmentIndex < drawableSegments.length;
      segmentIndex += 1
    ) {
      const [[x1, y1], [x2, y2]] = drawableSegments[segmentIndex];
      p.line(x1, y1, x2, y2);
    }

    if (!params.debug) {
      continue;
    }

    const allPoints = dynamicSegments.allPoints;
    const debugPoints = allPoints.map((t) => dynamicSegments.getPointOnLine(t));
    const internalPoints = debugPoints.slice(1, -1);

    p.push();
    p.noFill();
    p.stroke(255, 64, 64, 200);
    p.strokeWeight(Math.max(1, params.lineThickness * 0.2));
    for (let segmentIndex = 0; segmentIndex < drawableSegments.length; segmentIndex += 1) {
      const [[x1, y1], [x2, y2]] = drawableSegments[segmentIndex];
      p.line(x1, y1, x2, y2);
    }
    p.pop();

    p.push();
    p.stroke(0, 200, 255, 220);
    p.strokeWeight(1);
    p.fill(0, 200, 255, 220);
    for (let pointIndex = 0; pointIndex < debugPoints.length; pointIndex += 1) {
      const [px, py] = debugPoints[pointIndex];
      p.circle(px, py, 5);
    }
    p.pop();

    p.push();
    p.noStroke();
    p.fill(80, 160, 255, 110);
    for (let pointIndex = 0; pointIndex < internalPoints.length; pointIndex += 1) {
      const [px, py] = internalPoints[pointIndex];
      p.circle(px, py, params.segmentGap);
    }
    p.pop();

    p.push();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(10);
    p.fill(255, 150, 150, 220);
    p.noStroke();
    for (let segmentIndex = 0; segmentIndex < drawableSegments.length; segmentIndex += 1) {
      const [[x1, y1], [x2, y2]] = drawableSegments[segmentIndex];
      const length = Math.hypot(x2 - x1, y2 - y1);
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      p.text(`${Math.round(length)}`, cx, cy);
    }
    p.pop();
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
