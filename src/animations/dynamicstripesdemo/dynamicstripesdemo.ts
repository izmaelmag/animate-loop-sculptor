import p5 from "p5";
import {
  AnimationSettings,
  P5AnimationFunction,
  FrameContext,
} from "../../types/animations";
import { Point, Segment } from "../../utils/DynamicSegments";
import { GapPolicy, StraightLinePath } from "../../utils/segmentation";
import { NormalizedSegment } from "../../utils/segmentation/types";
import { defaultParams, resolveDynamicStripesParams } from "./settings";
import { createDynamicStripesParamsPane } from "./createParamsPane";
import { buildParallelLines } from "./geometry";
import { buildOscillatingPointPositions, wrap01 } from "./motion";
import { drawDebugSegments } from "./debugDraw";
import {
  buildLogicalSegmentsFromPoints,
  splitSegmentsToUnitInterval,
  wrapPointsForDebug,
} from "./segments";
import { createTextStripTexture, drawTextStripOnSegment } from "./textStrip";

const FPS = 60;
const WIDTH = 1080;
const HEIGHT = 1920;
const DURATION_SECONDS = 15;
const TOTAL_FRAMES = FPS * DURATION_SECONDS;
const LINE_PHASE_STEP = 0.2;
const gapPolicy = new GapPolicy({
  gap: defaultParams.segmentGap,
  minSegmentLength: defaultParams.minSegmentLengthPx,
  strictGap: defaultParams.strictGap,
});

interface TextStripCache {
  key: string;
  texture: p5.Graphics | null;
}

const textStripCache: TextStripCache = {
  key: "",
  texture: null,
};

const mapSegmentsToPixels = (
  path: StraightLinePath,
  normalizedSegments: NormalizedSegment[],
): Segment[] => {
  return normalizedSegments.map(([startT, endT]) => [
    path.getPointAt(startT),
    path.getPointAt(endT),
  ]);
};

const getTextStripKey = (
  text: string,
  color: string,
  thickness: number,
): string => {
  return `${text}|${color}|${Math.round(thickness)}`;
};

const ensureTextStripTexture = (
  p: p5,
  text: string,
  color: string,
  thickness: number,
): p5.Graphics => {
  const key = getTextStripKey(text, color, thickness);
  if (textStripCache.texture && textStripCache.key === key) {
    return textStripCache.texture;
  }

  if (textStripCache.texture) {
    textStripCache.texture.remove();
    textStripCache.texture = null;
  }

  textStripCache.texture = createTextStripTexture(p, text, color, thickness);
  textStripCache.key = key;
  return textStripCache.texture;
};

const draw: P5AnimationFunction = (p: p5, ctx: FrameContext): void => {
  const params = resolveDynamicStripesParams(ctx.params);
  const diagonalLines = buildParallelLines(
    WIDTH,
    HEIGHT,
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
  const originDirectionSign = params.originDirection === "backward" ? -1 : 1;
  const originOffset = wrap01(
    loopT * params.originCycles * originDirectionSign,
  );
  const directionSign = params.waveDirection === "tr-bl" ? 1 : -1;
  const strokeCapMode =
    params.strokeCap === "square"
      ? p.SQUARE
      : params.strokeCap === "project"
        ? p.PROJECT
        : p.ROUND;

  p.background(params.backgroundColor);
  p.noFill();
  const textStrip = ensureTextStripTexture(
    p,
    params.segmentText,
    params.segmentColor,
    params.lineThickness,
  );
  p.stroke(params.segmentColor);
  p.strokeWeight(params.lineThickness);
  p.strokeCap(strokeCapMode);

  for (let lineIndex = 0; lineIndex < diagonalLines.length; lineIndex += 1) {
    const { a: lineA, b: lineB, phaseOrder } = diagonalLines[lineIndex];
    const path = new StraightLinePath(lineA, lineB);
    gapPolicy.setGap(params.segmentGap);
    gapPolicy.setMinSegmentLength(params.minSegmentLengthPx);
    gapPolicy.setStrictGap(params.strictGap);

    const oscillatingPoints = buildOscillatingPointPositions({
      pointCount: params.segmentCount + 1,
      baseTimePhase,
      phaseDelta: params.phaseDelta,
      directionSign,
      phaseOrder,
      linePhaseStep: LINE_PHASE_STEP,
      originOffset,
      amplitude: params.amplitude,
    });
    const logicalSegments = buildLogicalSegmentsFromPoints(oscillatingPoints);
    const drawableLogicalSegments = gapPolicy.getDrawableNormalizedSegments(
      logicalSegments,
      path.getLength(),
      false,
      false,
    );
    const drawableNormalizedSegments = splitSegmentsToUnitInterval(
      drawableLogicalSegments,
    );
    const drawableSegments = mapSegmentsToPixels(path, drawableNormalizedSegments);
    for (
      let segmentIndex = 0;
      segmentIndex < drawableSegments.length;
      segmentIndex += 1
    ) {
      const [[x1, y1], [x2, y2]] = drawableSegments[segmentIndex];
      drawTextStripOnSegment(
        p,
        textStrip,
        x1,
        y1,
        x2,
        y2,
        params.lineThickness,
      );
    }

    if (!params.debug) {
      continue;
    }

    drawDebugSegments({
      p,
      pointsPx: wrapPointsForDebug(oscillatingPoints).map((t) => path.getPointAt(t) as Point),
      drawableSegments,
      lineThickness: params.lineThickness,
      segmentGap: params.segmentGap,
    });
  }
};

const setup = (p: p5): void => {
  p.background(defaultParams.backgroundColor);
  p.frameRate(FPS);
  ensureTextStripTexture(
    p,
    defaultParams.segmentText,
    defaultParams.segmentColor,
    defaultParams.lineThickness,
  );
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
