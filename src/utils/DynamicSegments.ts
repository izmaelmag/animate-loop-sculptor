import { PathSegments } from "./segmentation/PathSegments";
import { StraightLinePath } from "./segmentation/StraightLinePath";
import {
  DynamicSegmentsOptions,
  NormalizedSegment,
  Point,
  Segment,
} from "./segmentation/types";

export type { Point, Segment, NormalizedSegment, DynamicSegmentsOptions };

/**
 * Backward-compatible adapter for straight-line segmentation.
 * Internally delegates to path-agnostic PathSegments.
 */
export class DynamicSegments {
  private _linePath: StraightLinePath;
  private _segments: PathSegments;

  constructor(
    a: Point,
    b: Point,
    splitPointsOrOptions: number[] | DynamicSegmentsOptions = [],
  ) {
    this._linePath = new StraightLinePath(a, b);
    this._segments = new PathSegments(this._linePath, splitPointsOrOptions);
  }

  get splitPoints(): number[] {
    return this._segments.splitPoints;
  }

  get segmentCount(): number {
    return this._segments.segmentCount;
  }

  get gap(): number {
    return this._segments.gap;
  }

  get minSegmentLength(): number {
    return this._segments.minSegmentLength;
  }

  get strictGap(): boolean {
    return this._segments.strictGap;
  }

  get allPoints(): number[] {
    return this._segments.allPoints;
  }

  public setPoints(a: Point, b: Point): void {
    this._linePath.setPoints(a, b);
    this._segments.setPath(this._linePath);
  }

  public setSplitPoints(points: number[]): void {
    this._segments.setSplitPoints(points);
  }

  public setSegmentCount(segmentCount: number): void {
    this._segments.setSegmentCount(segmentCount);
  }

  public setGap(gap: number): void {
    this._segments.setGap(gap);
  }

  public setMinSegmentLength(minSegmentLength: number): void {
    this._segments.setMinSegmentLength(minSegmentLength);
  }

  public setStrictGap(strictGap: boolean): void {
    this._segments.setStrictGap(strictGap);
  }

  public updateSplitPoints(deltas: number[]): void {
    this._segments.updateSplitPoints(deltas);
  }

  public getNormalizedSegments(): NormalizedSegment[] {
    return this._segments.getNormalizedSegments();
  }

  public getSegmentsPx(): Segment[] {
    return this._segments.getSegmentsPx();
  }

  public getDrawableNormalizedSegments(): NormalizedSegment[] {
    return this._segments.getDrawableNormalizedSegments();
  }

  public getDrawableSegmentsPx(): Segment[] {
    return this._segments.getDrawableSegmentsPx();
  }

  public getPointOnLine(progress: number): Point {
    return this._segments.getPointOnPath(progress);
  }

  public evenSplit(count: number): Segment[] {
    return this._segments.evenSplit(count);
  }
}
