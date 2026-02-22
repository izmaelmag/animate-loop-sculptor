import { describe, expect, it } from "vitest";
import { GapPolicy } from "./GapPolicy";

describe("GapPolicy", () => {
  it("trims normalized segments by gap", () => {
    const policy = new GapPolicy({ gap: 10 });
    const drawable = policy.getDrawableNormalizedSegments(
      [
        [0, 0.5],
        [0.5, 1],
      ],
      100,
    );
    expect(drawable).toEqual([
      [0, 0.45],
      [0.55, 1],
    ]);
  });

  it("enforces strict gap constraints on split points", () => {
    const policy = new GapPolicy({
      gap: 10,
      minSegmentLength: 8,
      strictGap: true,
    });
    const constrained = policy.enforceStrictGapOnSplitPoints([0.65, 0.2, 0.95], 100);
    expect(constrained.length).toBe(3);
    for (const point of constrained) {
      expect(point).toBeGreaterThanOrEqual(0);
      expect(point).toBeLessThanOrEqual(1);
    }
  });
});
