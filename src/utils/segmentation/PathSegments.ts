import { Path2D } from "./Path2D";
import { GapPolicy } from "./GapPolicy";
import { SplitPointsModel } from "./SplitPointsModel";
import { DynamicSegmentsOptions, NormalizedSegment, Segment } from "./types";

export class PathSegments {
  private _path: Path2D;
  private _splitPointsModel: SplitPointsModel;
  private _gapPolicy: GapPolicy;

  constructor(path: Path2D, splitPointsOrOptions: number[] | DynamicSegmentsOptions = []) {
    this._path = path;

    if (Array.isArray(splitPointsOrOptions)) {
      this._splitPointsModel = new SplitPointsModel(splitPointsOrOptions);
      this._gapPolicy = new GapPolicy();
      return;
    }

    this._splitPointsModel = Array.isArray(splitPointsOrOptions.splitPoints)
      ? new SplitPointsModel(splitPointsOrOptions.splitPoints)
      : new SplitPointsModel(splitPointsOrOptions.segmentCount ?? 1);
    this._gapPolicy = new GapPolicy({
      gap: splitPointsOrOptions.gap ?? 0,
      minSegmentLength: splitPointsOrOptions.minSegmentLength ?? 1,
      strictGap: splitPointsOrOptions.strictGap === true,
    });

    this._applyStrictGapConstraints();
  }

  get splitPoints(): number[] {
    return this._splitPointsModel.splitPoints;
  }

  get segmentCount(): number {
    return this._splitPointsModel.segmentCount;
  }

  get gap(): number {
    return this._gapPolicy.gap;
  }

  get minSegmentLength(): number {
    return this._gapPolicy.minSegmentLength;
  }

  get strictGap(): boolean {
    return this._gapPolicy.strictGap;
  }

  get allPoints(): number[] {
    return this._splitPointsModel.allPoints;
  }

  public setPath(path: Path2D): void {
    this._path = path;
    this._applyStrictGapConstraints();
  }

  public setSplitPoints(points: number[]): void {
    this._splitPointsModel.setSplitPoints(points);
    this._applyStrictGapConstraints();
  }

  public setSegmentCount(segmentCount: number): void {
    this._splitPointsModel.setSegmentCount(segmentCount);
    this._applyStrictGapConstraints();
  }

  public setGap(gap: number): void {
    this._gapPolicy.setGap(gap);
  }

  public setMinSegmentLength(minSegmentLength: number): void {
    this._gapPolicy.setMinSegmentLength(minSegmentLength);
  }

  public setStrictGap(strictGap: boolean): void {
    this._gapPolicy.setStrictGap(strictGap);
    this._applyStrictGapConstraints();
  }

  public updateSplitPoints(deltas: number[]): void {
    this._splitPointsModel.updateSplitPoints(deltas);
    this._applyStrictGapConstraints();
  }

  public getNormalizedSegments(): NormalizedSegment[] {
    const points = this._splitPointsModel.allPoints;
    const segments: NormalizedSegment[] = [];

    for (let index = 0; index < points.length - 1; index += 1) {
      segments.push([points[index], points[index + 1]]);
    }

    return segments;
  }

  public getSegmentsPx(): Segment[] {
    return this.getNormalizedSegments().map(([startT, endT]) => [
      this._path.getPointAt(startT),
      this._path.getPointAt(endT),
    ]);
  }

  public getDrawableNormalizedSegments(): NormalizedSegment[] {
    return this._gapPolicy.getDrawableNormalizedSegments(
      this.getNormalizedSegments(),
      this._path.getLength(),
    );
  }

  public getDrawableSegmentsPx(): Segment[] {
    return this.getDrawableNormalizedSegments().map(([startT, endT]) => [
      this._path.getPointAt(startT),
      this._path.getPointAt(endT),
    ]);
  }

  public getPointOnPath(progress: number) {
    return this._path.getPointAt(progress);
  }

  public evenSplit(count: number): Segment[] {
    if (count <= 0) {
      return [];
    }
    this.setSegmentCount(count);
    return this.getSegmentsPx();
  }

  private _applyStrictGapConstraints(): void {
    const constrainedPoints = this._gapPolicy.enforceStrictGapOnSplitPoints(
      this._splitPointsModel.splitPoints,
      this._path.getLength(),
    );
    this._splitPointsModel.replaceSplitPoints(constrainedPoints);
  }
}
