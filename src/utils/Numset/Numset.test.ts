import { Numset } from "./Numset";
import { describe, it, expect, beforeEach } from "vitest";

describe("Numset", () => {
  let numset: Numset;

  beforeEach(() => {
    numset = new Numset([0, 0, 0, 0]);
  });

  it("should initialize with correct values", () => {
    expect(numset.values).toEqual([0, 0, 0, 0]);
    expect(numset.valueAt(1)).toBe(0);
  });

  it("should return 0 for out of bounds indices", () => {
    expect(numset.valueAt(-1)).toBe(0);
    expect(numset.valueAt(10)).toBe(0);
  });

  it("should stay at initial values before animation starts", () => {
    numset.change([0, 6, 2, 1], 60, 60);
    
    // Check frames before animation starts
    numset.step(0);
    expect(numset.values).toEqual([0, 0, 0, 0]);
    
    numset.step(59);
    expect(numset.values).toEqual([0, 0, 0, 0]);
  });

  it("should animate to target values", () => {
    numset.change([10, 20, 30, 40], 10, 10);
    
    // Check a frame after animation has started
    numset.step(11);
    expect(numset.valueAt(0)).toBeGreaterThan(0);
    
    // Middle of animation
    numset.step(15);
    for (let i = 0; i < 4; i++) {
      expect(numset.valueAt(i)).toBeGreaterThan(0);
    }
    
    // End of animation
    numset.step(20);
    expect(numset.values).toEqual([10, 20, 30, 40]);
  });

  it("should handle sequential animations", () => {
    numset.change([0, 6, 2, 1], 60, 60);
    numset.change([10, 10, 10, 10], 120, 60);
    
    // Before first animation
    numset.step(0);
    expect(numset.values).toEqual([0, 0, 0, 0]);
    
    // During first animation
    numset.step(90);
    // At frame 90, we should be halfway through the first animation
    // With the default easing, it won't be exactly halfway
    expect(numset.valueAt(1)).toBeGreaterThan(0);
    expect(numset.valueAt(1)).toBeLessThan(6);
    
    // End of first animation
    numset.step(120);
    expect(numset.values).toEqual([0, 6, 2, 1]);
    
    // During second animation
    numset.step(150);
    // Should be midway between [0, 6, 2, 1] and [10, 10, 10, 10]
    expect(numset.valueAt(0)).toBeGreaterThan(0);
    expect(numset.valueAt(1)).toBeLessThan(10);
    
    // End of second animation
    numset.step(180);
    expect(numset.values).toEqual([10, 10, 10, 10]);
  });

  it("should use custom easing function", () => {
    const linearEasing = (t: number) => t;
    numset.setEasing(linearEasing);
    
    numset.change([0, 10, 0, 0], 10, 10);
    
    // With linear easing, at the halfway point, the value should be exactly 5
    numset.step(15);
    expect(numset.valueAt(1)).toBeCloseTo(5, 0);
  });

  it("should handle mismatched array lengths", () => {
    numset = new Numset([0, 0, 0, 0]);
    
    // Too short - should pad with zeros
    numset.change([1, 2], 10, 10);
    numset.step(20);
    expect(numset.values).toEqual([1, 2, 0, 0]);
    
    // Too long - should truncate
    numset.change([5, 6, 7, 8, 9, 10], 30, 10);
    numset.step(40);
    expect(numset.values).toEqual([5, 6, 7, 8]);
  });

  it("should match example from requirement", () => {
    const nums = new Numset([0, 0, 0, 0]);
    nums.change([0, 6, 2, 1], 60, 60);
    
    // At frame 90, which is halfway through the animation
    nums.step(90);
    
    // With default easing, the progress won't be exactly 0.5
    // But we should be roughly halfway to the target for index 1
    const value = nums.valueAt(1);
    expect(value).toBeGreaterThan(2); // Should be progressing toward 6
    expect(value).toBeLessThan(6);    // But not yet reached 6
  });
}); 