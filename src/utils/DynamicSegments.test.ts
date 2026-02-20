import { describe, expect, it } from "vitest";
import { DynamicSegments } from "./DynamicSegments";

describe("DynamicSegments", () => {
  it("initializes splitPoints and allPoints", () => {
    const segments = new DynamicSegments([0, 0], [100, 100], [0.25, 0.5, 0.75]);

    expect(segments.splitPoints).toEqual([0.25, 0.5, 0.75]);
    expect(segments.allPoints).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it("builds normalized segments from split points", () => {
    const segments = new DynamicSegments([0, 0], [100, 100], [0.25, 0.5, 0.75]);

    expect(segments.getNormalizedSegments()).toEqual([
      [0, 0.25],
      [0.25, 0.5],
      [0.5, 0.75],
      [0.75, 1],
    ]);
  });

  it("updates split points by deltas", () => {
    const segments = new DynamicSegments([0, 0], [100, 100], [0.25, 0.5, 0.75]);

    segments.updateSplitPoints([0.05, 0.01, -0.1]);

    expect(segments.splitPoints).toEqual([0.3, 0.51, 0.65]);
    expect(segments.allPoints).toEqual([0, 0.3, 0.51, 0.65, 1]);
  });

  it("clamps updated values to [0, 1]", () => {
    const segments = new DynamicSegments([0, 0], [100, 100], [0.05, 0.95]);

    segments.updateSplitPoints([-0.5, 0.5]);

    expect(segments.splitPoints).toEqual([0, 1]);
  });

  it("keeps index order without sorting", () => {
    const segments = new DynamicSegments([0, 0], [100, 100], [0.9, 0.1]);

    segments.updateSplitPoints([0.2, -0.2]);

    expect(segments.splitPoints).toEqual([1, 0]);
    expect(segments.allPoints).toEqual([0, 1, 0, 1]);
  });

  it("allows zero-length segments", () => {
    const segments = new DynamicSegments([0, 0], [100, 100], [0.5, 0.5]);

    expect(segments.getNormalizedSegments()).toEqual([
      [0, 0.5],
      [0.5, 0.5],
      [0.5, 1],
    ]);
  });

  it("converts normalized segments to pixel segments", () => {
    const segments = new DynamicSegments([0, 0], [100, 0], [0.25, 0.5, 0.75]);

    expect(segments.getSegmentsPx()).toEqual([
      [
        [0, 0],
        [25, 0],
      ],
      [
        [25, 0],
        [50, 0],
      ],
      [
        [50, 0],
        [75, 0],
      ],
      [
        [75, 0],
        [100, 0],
      ],
    ]);
  });

  it("clamps getPointOnLine progress to [0, 1]", () => {
    const segments = new DynamicSegments([10, 20], [110, 220], []);

    expect(segments.getPointOnLine(-1)).toEqual([10, 20]);
    expect(segments.getPointOnLine(2)).toEqual([110, 220]);
  });

  it("supports even split in pixel space", () => {
    const segments = new DynamicSegments([0, 0], [100, 0]);

    expect(segments.evenSplit(4)).toEqual([
      [
        [0, 0],
        [25, 0],
      ],
      [
        [25, 0],
        [50, 0],
      ],
      [
        [50, 0],
        [75, 0],
      ],
      [
        [75, 0],
        [100, 0],
      ],
    ]);

    expect(segments.splitPoints).toEqual([0.25, 0.5, 0.75]);
  });

  it("supports constructor options with segmentCount and gap", () => {
    const segments = new DynamicSegments([0, 0], [100, 0], {
      segmentCount: 4,
      gap: 10,
    });

    expect(segments.segmentCount).toBe(4);
    expect(segments.gap).toBe(10);
    expect(segments.splitPoints).toEqual([0.25, 0.5, 0.75]);
  });

  it("allows setting segment count and gap from class API", () => {
    const segments = new DynamicSegments([0, 0], [100, 0], [0.5]);

    segments.setSegmentCount(5);
    segments.setGap(12);

    expect(segments.segmentCount).toBe(5);
    expect(segments.gap).toBe(12);
    expect(segments.splitPoints).toEqual([0.2, 0.4, 0.6, 0.8]);
  });

  it("returns drawable segments trimmed by gap", () => {
    const segments = new DynamicSegments([0, 0], [100, 0], {
      splitPoints: [0.5],
      gap: 10,
    });

    expect(segments.getDrawableNormalizedSegments()).toEqual([
      [0, 0.45],
      [0.55, 1],
    ]);

    const drawablePx = segments.getDrawableSegmentsPx();
    expect(drawablePx[0]).toEqual([
      [0, 0],
      [45, 0],
    ]);
    expect(drawablePx[1][0][0]).toBeCloseTo(55, 8);
    expect(drawablePx[1][0][1]).toBe(0);
    expect(drawablePx[1][1]).toEqual([100, 0]);
  });

  it("keeps edge anchors for first and last drawable segments", () => {
    const segments = new DynamicSegments([10, 0], [110, 0], {
      segmentCount: 4,
      gap: 80,
    });

    const drawablePx = segments.getDrawableSegmentsPx();
    expect(drawablePx[0][0]).toEqual([10, 0]);
    expect(drawablePx[drawablePx.length - 1][1]).toEqual([110, 0]);
  });

  it("keeps same pixel gap for different line lengths", () => {
    const shortLine = new DynamicSegments([0, 0], [100, 0], {
      splitPoints: [0.5],
      gap: 20,
    });
    const longLine = new DynamicSegments([0, 0], [200, 0], {
      splitPoints: [0.5],
      gap: 20,
    });

    const shortSegments = shortLine.getDrawableSegmentsPx();
    const longSegments = longLine.getDrawableSegmentsPx();

    const shortGap = shortSegments[1][0][0] - shortSegments[0][1][0];
    const longGap = longSegments[1][0][0] - longSegments[0][1][0];

    expect(shortGap).toBeCloseTo(20, 8);
    expect(longGap).toBeCloseTo(20, 8);
  });

  it("keeps minimum segment length even with large gap", () => {
    const segments = new DynamicSegments([0, 0], [100, 0], {
      splitPoints: [0.5],
      gap: 80,
      minSegmentLength: 12,
    });

    const drawablePx = segments.getDrawableSegmentsPx();
    const firstLength = Math.abs(drawablePx[0][1][0] - drawablePx[0][0][0]);
    const secondLength = Math.abs(drawablePx[1][1][0] - drawablePx[1][0][0]);

    expect(firstLength).toBeGreaterThanOrEqual(12);
    expect(secondLength).toBeGreaterThanOrEqual(12);
  });
});
