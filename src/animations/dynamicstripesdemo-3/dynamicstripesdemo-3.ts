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
  splitSegmentsToUnitIntervalWithOwners,
  wrapPointsForDebug,
} from "./segments";
import { createTextStripTexture, drawTextStripOnSegment } from "./textStrip";
import { LineSegmentNotation } from "../../utils/dsl";

const FPS = 60;
const WIDTH = 1080;
const HEIGHT = 1920;
const DURATION_SECONDS = 15;
const TOTAL_FRAMES = FPS * DURATION_SECONDS;
const LINE_PHASE_STEP = 0.6;
const gapPolicy = new GapPolicy({
  gap: defaultParams.segmentGap,
  minSegmentLength: defaultParams.minSegmentLengthPx,
  strictGap: defaultParams.strictGap,
});

interface TextStripCache {
  texturesByKey: Map<string, p5.Graphics>;
}

const textStripCache: TextStripCache = {
  texturesByKey: new Map(),
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
  const cached = textStripCache.texturesByKey.get(key);
  if (cached) {
    return cached;
  }

  if (textStripCache.texturesByKey.size > 256) {
    textStripCache.texturesByKey.forEach((texture) => texture.remove());
    textStripCache.texturesByKey.clear();
  }

  const texture = createTextStripTexture(p, text, color, thickness);
  textStripCache.texturesByKey.set(key, texture);
  return texture;
};

const isHexColor = (value: string): boolean => {
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value);
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
  const textNotation = new LineSegmentNotation(params.segmentTextNotation);
  const colorNotation = new LineSegmentNotation(params.segmentColorNotation);
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
    const drawablePieces = splitSegmentsToUnitIntervalWithOwners(
      drawableLogicalSegments,
    );
    const drawableNormalizedSegments = drawablePieces.map(
      (piece) => piece.segment,
    );
    const drawableSegments = mapSegmentsToPixels(
      path,
      drawableNormalizedSegments,
    );
    for (
      let segmentIndex = 0;
      segmentIndex < drawableSegments.length;
      segmentIndex += 1
    ) {
      const [[x1, y1], [x2, y2]] = drawableSegments[segmentIndex];
      const logicalSegmentIndex =
        drawablePieces[segmentIndex]?.ownerIndex ?? segmentIndex;
      const textTokenRaw = textNotation.resolveSegment(
        lineIndex,
        logicalSegmentIndex,
      );
      const textToken =
        typeof textTokenRaw === "string" && textTokenRaw.trim().length > 0
          ? textTokenRaw.trim()
          : params.segmentText;
      const colorTokenRaw = colorNotation
        .resolveSegment(lineIndex, logicalSegmentIndex)
        .trim();
      const colorToken = isHexColor(colorTokenRaw)
        ? colorTokenRaw
        : params.segmentColor;
      const textStrip = ensureTextStripTexture(
        p,
        textToken,
        colorToken,
        params.lineThickness,
      );
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
      pointsPx: wrapPointsForDebug(oscillatingPoints).map(
        (t) => path.getPointAt(t) as Point,
      ),
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
  id: "dynamicstripesdemo-3",
  parentId: "dynamicstripesdemo-2",
  name: "🎨 DynamicStripesDemo 3",
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
