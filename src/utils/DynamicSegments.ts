// 2D coordinate array
export type Point = [number, number];

// 2 points array. Represents coordinates of a segment along the line.
export type Segment = [Point, Point];

// Segment in normalized coordinates [0, 1]
export type NormalizedSegment = [number, number];

export interface DynamicSegmentsOptions {
  splitPoints?: number[];
  segmentCount?: number;
  gap?: number;
  minSegmentLength?: number;
  strictGap?: boolean;
}

/**
 * DynamicSegments stores internal normalized split points and computes
 * segments on demand for a straight line between points a and b.
 */
export class DynamicSegments {
  private _a: Point;
  private _b: Point;
  private _splitPoints: number[];
  private _segmentCount: number;
  private _gap: number;
  private _minSegmentLength: number;
  private _strictGap: boolean;

  constructor(
    a: Point,
    b: Point,
    splitPointsOrOptions: number[] | DynamicSegmentsOptions = [],
  ) {
    this._a = [...a];
    this._b = [...b];
    this._segmentCount = 1;
    this._gap = 0;
    this._minSegmentLength = 1;
    this._strictGap = false;

    if (Array.isArray(splitPointsOrOptions)) {
      this._splitPoints = this._normalizeSplitPoints(splitPointsOrOptions);
      this._segmentCount = this._splitPoints.length + 1;
      return;
    }

    this._gap = this._normalizeGap(splitPointsOrOptions.gap ?? 0);
    this._minSegmentLength = this._normalizeMinSegmentLength(
      splitPointsOrOptions.minSegmentLength ?? 1,
    );
    this._strictGap = splitPointsOrOptions.strictGap === true;
    if (Array.isArray(splitPointsOrOptions.splitPoints)) {
      this._splitPoints = this._normalizeSplitPoints(splitPointsOrOptions.splitPoints);
      this._segmentCount = this._splitPoints.length + 1;
      if (this._strictGap) {
        this._enforceStrictGapOnSplitPoints();
      }
      return;
    }

    this._segmentCount = this._normalizeSegmentCount(
      splitPointsOrOptions.segmentCount ?? 1,
    );
    this._splitPoints = this._buildEvenSplitPoints(this._segmentCount);
  }

  /**
   * Internal normalized split points without edges (0 and 1).
   */
  get splitPoints(): number[] {
    return [...this._splitPoints];
  }

  get segmentCount(): number {
    return this._segmentCount;
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

  /**
   * Full normalized point list: [0, ...splitPoints, 1].
   */
  get allPoints(): number[] {
    return [0, ...this._splitPoints, 1];
  }

  /**
   * Updates the straight line endpoints in pixel coordinates.
   */
  public setPoints(a: Point, b: Point): void {
    this._a = [...a];
    this._b = [...b];
  }

  /**
   * Replaces internal split points and clamps each value to [0, 1].
   */
  public setSplitPoints(points: number[]): void {
    this._splitPoints = this._normalizeSplitPoints(points);
    this._segmentCount = this._splitPoints.length + 1;
    if (this._strictGap) {
      this._enforceStrictGapOnSplitPoints();
    }
  }

  /**
   * Sets an even split by segment count and stores the value internally.
   */
  public setSegmentCount(segmentCount: number): void {
    this._segmentCount = this._normalizeSegmentCount(segmentCount);
    this._splitPoints = this._buildEvenSplitPoints(this._segmentCount);
    if (this._strictGap) {
      this._enforceStrictGapOnSplitPoints();
    }
  }

  /**
   * Sets fixed gap in pixels used by drawable segment methods.
   */
  public setGap(gap: number): void {
    this._gap = this._normalizeGap(gap);
  }

  /**
   * Sets minimum drawable segment length in pixels.
   */
  public setMinSegmentLength(minSegmentLength: number): void {
    this._minSegmentLength = this._normalizeMinSegmentLength(minSegmentLength);
  }

  /**
   * Keeps configured gap fixed by constraining split points layout.
   */
  public setStrictGap(strictGap: boolean): void {
    this._strictGap = strictGap;
    if (this._strictGap) {
      this._enforceStrictGapOnSplitPoints();
    }
  }

  /**
   * Increments split points by index. Missing increments are treated as 0.
   * Values are clamped to [0, 1], and index order is preserved.
   */
  public updateSplitPoints(deltas: number[]): void {
    this._splitPoints = this._splitPoints.map((point, index) => {
      const delta = deltas[index] ?? 0;
      return this._clamp(point + delta, 0, 1);
    });
    if (this._strictGap) {
      this._enforceStrictGapOnSplitPoints();
    }
  }

  /**
   * Returns contiguous normalized segments built from all points.
   */
  public getNormalizedSegments(): NormalizedSegment[] {
    const points = this.allPoints;
    const segments: NormalizedSegment[] = [];

    for (let index = 0; index < points.length - 1; index += 1) {
      segments.push([points[index], points[index + 1]]);
    }

    return segments;
  }

  /**
   * Returns pixel-space segments for the current straight line.
   */
  public getSegmentsPx(): Segment[] {
    return this.getNormalizedSegments().map(([startT, endT]) => [
      this.getPointOnLine(startT),
      this.getPointOnLine(endT),
    ]);
  }

  /**
   * Returns normalized segments trimmed by the stored fixed pixel gap.
   */
  public getDrawableNormalizedSegments(): NormalizedSegment[] {
    const lineLength = this._lineLength();
    const normalizedGap = this._getEffectiveGapNormalized(lineLength);
    const normalizedHalfGap = normalizedGap / 2;
    const drawableSegments: NormalizedSegment[] = [];
    const normalizedSegments = this.getNormalizedSegments();
    const lastSegmentIndex = normalizedSegments.length - 1;

    for (let segmentIndex = 0; segmentIndex < normalizedSegments.length; segmentIndex += 1) {
      const [startT, endT] = normalizedSegments[segmentIndex];
      const length = Math.abs(endT - startT);
      const trim = this._strictGap
        ? normalizedHalfGap
        : Math.min(normalizedHalfGap, length / 2);
      const direction = startT <= endT ? 1 : -1;

      // Keep line anchors fixed at t=0 and t=1 for outer segments.
      const trimStart = segmentIndex === 0 ? 0 : trim;
      const trimEnd = segmentIndex === lastSegmentIndex ? 0 : trim;

      const drawStartT = startT + direction * trimStart;
      const drawEndT = endT - direction * trimEnd;

      if (Math.abs(drawEndT - drawStartT) < 1e-6) {
        continue;
      }

      drawableSegments.push([drawStartT, drawEndT]);
    }

    return drawableSegments;
  }

  /**
   * Returns pixel-space segments trimmed by the stored gap ratio.
   */
  public getDrawableSegmentsPx(): Segment[] {
    return this.getDrawableNormalizedSegments().map(([startT, endT]) => [
      this.getPointOnLine(startT),
      this.getPointOnLine(endT),
    ]);
  }

  /**
   * Calculates a point on the current line by normalized progress.
   */
  public getPointOnLine(progress: number): Point {
    const t = this._clamp(progress, 0, 1);
    return [
      this._lerp(this._a[0], this._b[0], t),
      this._lerp(this._a[1], this._b[1], t),
    ];
  }

  /**
   * Creates evenly split pixel segments for a given segment count.
   */
  public evenSplit(count: number): Segment[] {
    if (count <= 0) return [];
    this.setSegmentCount(count);
    return this.getSegmentsPx();
  }

  private _normalizeSplitPoints(points: number[]): number[] {
    return points.map((point) => this._clamp(point, 0, 1));
  }

  private _buildEvenSplitPoints(segmentCount: number): number[] {
    if (segmentCount <= 1) {
      return [];
    }

    return Array.from(
      { length: segmentCount - 1 },
      (_, index) => (index + 1) / segmentCount,
    );
  }

  private _normalizeSegmentCount(value: number): number {
    if (!Number.isFinite(value)) return 1;
    return Math.max(1, Math.round(value));
  }

  private _normalizeGap(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, value);
  }

  private _normalizeMinSegmentLength(value: number): number {
    if (!Number.isFinite(value)) return 1;
    return Math.max(0, value);
  }

  private _getEffectiveGapNormalized(lineLength: number): number {
    if (lineLength <= 1e-9) {
      return 0;
    }

    const requestedGapNormalized = this._normalizeGap(this._gap) / lineLength;
    if (!this._strictGap) {
      return requestedGapNormalized;
    }

    const segmentCount = this._splitPoints.length + 1;
    const maxGapNormalized = segmentCount <= 1 ? 1 : 1 / (segmentCount - 1);
    return Math.min(requestedGapNormalized, maxGapNormalized);
  }

  private _getEffectiveMinSegmentLengthNormalized(
    lineLength: number,
    gapNormalized: number,
  ): number {
    if (lineLength <= 1e-9) {
      return 0;
    }

    const requestedMin = this._normalizeMinSegmentLength(this._minSegmentLength) / lineLength;
    const segmentCount = this._splitPoints.length + 1;
    if (segmentCount <= 0) {
      return 0;
    }

    // Sum constraints:
    // total = segmentCount * minSeg + (segmentCount - 1) * gap <= 1
    const maxMin = Math.max(0, (1 - (segmentCount - 1) * gapNormalized) / segmentCount);
    return Math.min(requestedMin, maxMin);
  }

  private _enforceStrictGapOnSplitPoints(): void {
    if (!this._strictGap || this._splitPoints.length === 0) {
      return;
    }

    const lineLength = this._lineLength();
    if (lineLength <= 1e-9) {
      return;
    }

    const gapNormalized = this._getEffectiveGapNormalized(lineLength);
    if (gapNormalized <= 0) {
      return;
    }
    const minSegmentNormalized = this._getEffectiveMinSegmentLengthNormalized(
      lineLength,
      gapNormalized,
    );

    const intervalCount = this._splitPoints.length + 1;
    const fullPoints = [0, ...this._splitPoints, 1];
    const required: number[] = [];
    for (let index = 0; index < intervalCount; index += 1) {
      const minInterval = index === 0 || index === intervalCount - 1
        ? minSegmentNormalized + gapNormalized / 2
        : minSegmentNormalized + gapNormalized;
      required.push(minInterval);
    }

    // Forward pass
    for (let index = 1; index < fullPoints.length - 1; index += 1) {
      const minPoint = fullPoints[index - 1] + required[index - 1];
      if (fullPoints[index] < minPoint) {
        fullPoints[index] = minPoint;
      }
    }

    // Backward pass
    for (let index = fullPoints.length - 2; index >= 1; index -= 1) {
      const maxPoint = fullPoints[index + 1] - required[index];
      if (fullPoints[index] > maxPoint) {
        fullPoints[index] = maxPoint;
      }
    }

    this._splitPoints = fullPoints.slice(1, -1).map((point) => this._clamp(point, 0, 1));
  }

  private _lineLength(): number {
    const dx = this._b[0] - this._a[0];
    const dy = this._b[1] - this._a[1];
    return Math.hypot(dx, dy);
  }

  private _lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private _clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
  }
}
