import { describe, expect, it } from "vitest";
import { SplitPointsModel } from "./SplitPointsModel";

describe("SplitPointsModel", () => {
  it("initializes from split points", () => {
    const model = new SplitPointsModel([0.25, 0.5, 0.75]);
    expect(model.splitPoints).toEqual([0.25, 0.5, 0.75]);
    expect(model.segmentCount).toBe(4);
    expect(model.allPoints).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it("builds even split points from segment count", () => {
    const model = new SplitPointsModel(4);
    expect(model.splitPoints).toEqual([0.25, 0.5, 0.75]);
  });

  it("clamps split point updates", () => {
    const model = new SplitPointsModel([0.05, 0.95]);
    model.updateSplitPoints([-1, 1]);
    expect(model.splitPoints).toEqual([0, 1]);
  });
});
