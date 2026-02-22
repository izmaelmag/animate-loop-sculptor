import { describe, expect, it } from "vitest";
import { PathSegments } from "./PathSegments";
import { StraightLinePath } from "./StraightLinePath";

describe("PathSegments", () => {
  it("builds pixel segments from normalized points", () => {
    const segments = new PathSegments(new StraightLinePath([0, 0], [100, 0]), [0.25, 0.5]);
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
        [100, 0],
      ],
    ]);
  });

  it("keeps strict gap constraints while updating split points", () => {
    const segments = new PathSegments(new StraightLinePath([0, 0], [100, 0]), {
      splitPoints: [0.25, 0.5, 0.75],
      gap: 10,
      minSegmentLength: 8,
      strictGap: true,
    });
    segments.updateSplitPoints([0.4, -0.4, 0.2]);
    const drawablePx = segments.getDrawableSegmentsPx();

    for (const [a, b] of drawablePx) {
      expect(Math.abs(b[0] - a[0])).toBeGreaterThanOrEqual(7.999);
    }

    for (let index = 0; index < drawablePx.length - 1; index += 1) {
      const gap = drawablePx[index + 1][0][0] - drawablePx[index][1][0];
      expect(gap).toBeCloseTo(10, 8);
    }
  });
});
