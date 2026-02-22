export type Point = [number, number];

export type Segment = [Point, Point];

export type NormalizedSegment = [number, number];

export interface DynamicSegmentsOptions {
  splitPoints?: number[];
  segmentCount?: number;
  gap?: number;
  minSegmentLength?: number;
  strictGap?: boolean;
}
