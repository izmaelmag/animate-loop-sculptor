import { describe, expect, it } from "vitest";
import { GapPolicy } from "../../utils/segmentation";
import {
  buildLogicalSegmentsFromPoints,
  splitSegmentsToUnitInterval,
  wrapPointsForDebug,
} from "./segments";

describe("dynamic stripes marquee segments", () => {
  it("keeps segmentCount logical segments for pointCount = segmentCount + 1", () => {
    const points = [0.1, 0.3, 0.5, 0.7, 0.9, 1.1];
    const logical = buildLogicalSegmentsFromPoints(points);
    expect(logical.length).toBe(5);
  });

  it("splits seam-crossing segments into continuous render pieces", () => {
    const pieces = splitSegmentsToUnitInterval([
      [0.92, 1.08],
    ]);
    expect(pieces.length).toBe(2);
    expect(pieces[0][0]).toBeCloseTo(0.92, 8);
    expect(pieces[0][1]).toBeCloseTo(1, 8);
    expect(pieces[1][0]).toBeCloseTo(0, 8);
    expect(pieces[1][1]).toBeCloseTo(0.08, 8);
  });

  it("keeps regular gap on seam like other joins", () => {
    const gapPolicy = new GapPolicy({
      gap: 0.1,
      strictGap: false,
    });
    const trimmed = gapPolicy.getDrawableNormalizedSegments([[0.9, 1.1]], 1, false, false);
    const pieces = splitSegmentsToUnitInterval(trimmed);
    expect(pieces.length).toBe(2);
    expect(pieces[0][0]).toBeCloseTo(0.95, 8);
    expect(pieces[0][1]).toBeCloseTo(1, 8);
    expect(pieces[1][0]).toBeCloseTo(0, 8);
    expect(pieces[1][1]).toBeCloseTo(0.05, 8);
  });

  it("wraps and sorts debug points into visible [0, 1] positions", () => {
    const debug = wrapPointsForDebug([0.92, 1.08, 1.25, 0.6]);
    expect(debug.length).toBe(4);
    expect(debug[0]).toBeCloseTo(0.08, 8);
    expect(debug[1]).toBeCloseTo(0.25, 8);
    expect(debug[2]).toBeCloseTo(0.6, 8);
    expect(debug[3]).toBeCloseTo(0.92, 8);
  });
});
