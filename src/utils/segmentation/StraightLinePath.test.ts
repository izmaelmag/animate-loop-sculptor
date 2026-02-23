import { describe, expect, it } from "vitest";
import { StraightLinePath } from "./StraightLinePath";

describe("StraightLinePath", () => {
  it("returns endpoints for t=0 and t=1", () => {
    const path = new StraightLinePath([10, 20], [110, 220]);
    expect(path.getPointAt(0)).toEqual([10, 20]);
    expect(path.getPointAt(1)).toEqual([110, 220]);
  });

  it("clamps t to [0, 1]", () => {
    const path = new StraightLinePath([10, 20], [110, 220]);
    expect(path.getPointAt(-10)).toEqual([10, 20]);
    expect(path.getPointAt(2)).toEqual([110, 220]);
  });

  it("updates points and length", () => {
    const path = new StraightLinePath([0, 0], [3, 4]);
    expect(path.getLength()).toBe(5);
    path.setPoints([0, 0], [6, 8]);
    expect(path.getLength()).toBe(10);
  });
});
