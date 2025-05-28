import { describe, it, expect } from "vitest";
import { frameToNormalizedTime, normalizedTimeToFrame } from "./animation";

describe("frameToNormalizedTime", () => {
  it("maps first and last frame correctly", () => {
    expect(frameToNormalizedTime(0, 60)).toBe(0);
    expect(frameToNormalizedTime(59, 60)).toBe(1);
  });

  it("is inverse of normalizedTimeToFrame for intermediate frames", () => {
    const total = 60;
    for (let frame = 0; frame < total - 1; frame++) {
      const t = frameToNormalizedTime(frame, total);
      expect(normalizedTimeToFrame(t, total)).toBe(frame);
    }
    // Last frame loops back to 0 when converting back
    const lastT = frameToNormalizedTime(total - 1, total);
    expect(normalizedTimeToFrame(lastT, total)).toBe(0);
  });
});
