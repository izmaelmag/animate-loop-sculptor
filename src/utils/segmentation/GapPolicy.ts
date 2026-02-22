import { normalizeGap, normalizeMinSegmentLength, clamp } from "./math";
import { NormalizedSegment } from "./types";

export interface GapPolicyConfig {
  gap?: number;
  minSegmentLength?: number;
  strictGap?: boolean;
}

export class GapPolicy {
  private _gap: number;
  private _minSegmentLength: number;
  private _strictGap: boolean;

  constructor(config: GapPolicyConfig = {}) {
    this._gap = normalizeGap(config.gap ?? 0);
    this._minSegmentLength = normalizeMinSegmentLength(config.minSegmentLength ?? 1);
    this._strictGap = config.strictGap === true;
  }

  get gap(): number {
    return this._gap;
  }

  get minSegmentLength(): number {
    return this._minSegmentLength;
  }

  get strictGap(): boolean {
    return this._strictGap;
  }

  public setGap(gap: number): void {
    this._gap = normalizeGap(gap);
  }

  public setMinSegmentLength(minSegmentLength: number): void {
    this._minSegmentLength = normalizeMinSegmentLength(minSegmentLength);
  }

  public setStrictGap(strictGap: boolean): void {
    this._strictGap = strictGap;
  }

  public getDrawableNormalizedSegments(
    normalizedSegments: NormalizedSegment[],
    pathLength: number,
    anchorEdges = true,
    noSeamGap = false,
  ): NormalizedSegment[] {
    const normalizedGap = this._getEffectiveGapNormalized(
      pathLength,
      normalizedSegments.length,
    );
    const normalizedHalfGap = normalizedGap / 2;
    const drawableSegments: NormalizedSegment[] = [];
    const lastSegmentIndex = normalizedSegments.length - 1;

    for (let segmentIndex = 0; segmentIndex < normalizedSegments.length; segmentIndex += 1) {
      const [startT, endT] = normalizedSegments[segmentIndex];
      const length = Math.abs(endT - startT);
      const trim = this._strictGap
        ? normalizedHalfGap
        : Math.min(normalizedHalfGap, length / 2);
      const direction = startT <= endT ? 1 : -1;
      const isFirstSegment = segmentIndex === 0;
      const isLastSegment = segmentIndex === lastSegmentIndex;
      const trimStart = anchorEdges && isFirstSegment ? 0 : trim;
      const trimEnd = anchorEdges && isLastSegment ? 0 : trim;

      const seamTrimStart = !anchorEdges && noSeamGap && isFirstSegment ? 0 : trimStart;
      const seamTrimEnd = !anchorEdges && noSeamGap && isLastSegment ? 0 : trimEnd;
      const drawStartT = startT + direction * seamTrimStart;
      const drawEndT = endT - direction * seamTrimEnd;

      if (Math.abs(drawEndT - drawStartT) < 1e-6) {
        continue;
      }
      drawableSegments.push([drawStartT, drawEndT]);
    }

    return drawableSegments;
  }

  public enforceStrictGapOnSplitPoints(
    splitPoints: number[],
    pathLength: number,
  ): number[] {
    if (!this._strictGap || splitPoints.length === 0) {
      return splitPoints;
    }
    if (pathLength <= 1e-9) {
      return splitPoints;
    }

    const segmentCount = splitPoints.length + 1;
    const gapNormalized = this._getEffectiveGapNormalized(pathLength, segmentCount);
    if (gapNormalized <= 0) {
      return splitPoints;
    }
    const minSegmentNormalized = this._getEffectiveMinSegmentLengthNormalized(
      pathLength,
      gapNormalized,
      segmentCount,
    );

    const intervalCount = splitPoints.length + 1;
    const fullPoints = [0, ...splitPoints, 1];
    const required: number[] = [];
    for (let index = 0; index < intervalCount; index += 1) {
      const minInterval = index === 0 || index === intervalCount - 1
        ? minSegmentNormalized + gapNormalized / 2
        : minSegmentNormalized + gapNormalized;
      required.push(minInterval);
    }

    for (let index = 1; index < fullPoints.length - 1; index += 1) {
      const minPoint = fullPoints[index - 1] + required[index - 1];
      if (fullPoints[index] < minPoint) {
        fullPoints[index] = minPoint;
      }
    }

    for (let index = fullPoints.length - 2; index >= 1; index -= 1) {
      const maxPoint = fullPoints[index + 1] - required[index];
      if (fullPoints[index] > maxPoint) {
        fullPoints[index] = maxPoint;
      }
    }

    return fullPoints.slice(1, -1).map((point) => clamp(point, 0, 1));
  }

  private _getEffectiveGapNormalized(pathLength: number, segmentCount: number): number {
    if (pathLength <= 1e-9) {
      return 0;
    }
    const requestedGapNormalized = normalizeGap(this._gap) / pathLength;
    if (!this._strictGap) {
      return requestedGapNormalized;
    }
    const maxGapNormalized = segmentCount <= 1 ? 1 : 1 / (segmentCount - 1);
    return Math.min(requestedGapNormalized, maxGapNormalized);
  }

  private _getEffectiveMinSegmentLengthNormalized(
    pathLength: number,
    gapNormalized: number,
    segmentCount: number,
  ): number {
    if (pathLength <= 1e-9) {
      return 0;
    }
    const requestedMin = normalizeMinSegmentLength(this._minSegmentLength) / pathLength;
    if (segmentCount <= 0) {
      return 0;
    }
    const maxMin = Math.max(0, (1 - (segmentCount - 1) * gapNormalized) / segmentCount);
    return Math.min(requestedMin, maxMin);
  }
}
