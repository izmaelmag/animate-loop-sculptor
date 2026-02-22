import { describe, expect, it } from "vitest";
import { buildOscillatingPointPositions } from "./motion";

describe("buildOscillatingPointPositions", () => {
  it("keeps evenly sized points under pure drift", () => {
    const pointCount = 6;
    const points = buildOscillatingPointPositions({
      pointCount,
      baseTimePhase: 0,
      phaseDelta: 0,
      directionSign: 1,
      phaseOrder: 0,
      linePhaseStep: 0.2,
      originOffset: 0.35,
      amplitude: 0,
    });
    expect(points.length).toBe(pointCount);
    const expectedStep = 1 / (pointCount - 1);
    for (let index = 1; index < points.length; index += 1) {
      expect(points[index] - points[index - 1]).toBeCloseTo(expectedStep, 8);
    }
  });

  it("keeps equal spacing with drift=1 and zero phase/amplitude", () => {
    const pointCount = 6;
    const points = buildOscillatingPointPositions({
      pointCount,
      baseTimePhase: 0,
      phaseDelta: 0,
      directionSign: 1,
      phaseOrder: 0,
      linePhaseStep: 0.2,
      originOffset: 1,
      amplitude: 0,
    });

    expect(points.length).toBe(pointCount);
    const expectedStep = 1 / (pointCount - 1);
    for (let index = 1; index < points.length; index += 1) {
      expect(points[index] - points[index - 1]).toBeCloseTo(expectedStep, 8);
    }
  });

  it("returns ordered wrapped points with non-zero phase and amplitude", () => {
    const pointCount = 6;
    const points = buildOscillatingPointPositions({
      pointCount,
      baseTimePhase: Math.PI * 1.5,
      phaseDelta: Math.PI,
      directionSign: -1,
      phaseOrder: 8,
      linePhaseStep: 0.2,
      originOffset: 0.95,
      amplitude: 0.19,
    });

    expect(points.length).toBe(pointCount);
    for (let index = 1; index < points.length; index += 1) {
      expect(points[index]).toBeGreaterThan(points[index - 1]);
    }
  });

  it("keeps points ordered even at high amplitude", () => {
    const pointCount = 8;
    const points = buildOscillatingPointPositions({
      pointCount,
      baseTimePhase: Math.PI / 3,
      phaseDelta: Math.PI / 2,
      directionSign: 1,
      phaseOrder: 3,
      linePhaseStep: 0.2,
      originOffset: 0.4,
      amplitude: 0.2,
    });

    expect(points.length).toBe(pointCount);
    for (let index = 1; index < points.length; index += 1) {
      expect(points[index]).toBeGreaterThan(points[index - 1]);
    }
    expect(points[points.length - 1] - points[0]).toBeCloseTo(1, 8);
  });

  it("applies phase to seam parent point as well", () => {
    const pointCount = 6;
    const a = buildOscillatingPointPositions({
      pointCount,
      baseTimePhase: 0,
      phaseDelta: 0.7,
      directionSign: 1,
      phaseOrder: 2,
      linePhaseStep: 0.2,
      originOffset: 0.2,
      amplitude: 0.05,
    });
    const b = buildOscillatingPointPositions({
      pointCount,
      baseTimePhase: Math.PI / 2,
      phaseDelta: 0.7,
      directionSign: 1,
      phaseOrder: 2,
      linePhaseStep: 0.2,
      originOffset: 0.2,
      amplitude: 0.05,
    });

    expect(a[0]).not.toBeCloseTo(b[0], 8);
    expect(a[a.length - 1] - a[0]).toBeCloseTo(1, 8);
    expect(b[b.length - 1] - b[0]).toBeCloseTo(1, 8);
  });
});
