import { Point } from "./Point";
import { describe, it, expect, beforeEach } from "vitest";

describe("Point", () => {
  let point: Point;

  beforeEach(() => {
    point = new Point(0, 0);
  });

  it("should initialize with correct coordinates", () => {
    expect(point.x).toBe(0);
    expect(point.y).toBe(0);
    expect(point.position).toEqual([0, 0]);
  });

  it("should stay at initial position before animation starts", () => {
    point.moveTo([100, 200], 120, 120);
    
    // Check frames before animation starts
    point.step(0);
    expect(point.position).toEqual([0, 0]);
    
    point.step(119);
    expect(point.position).toEqual([0, 0]);
  });

  it("should animate to target position", () => {
    point.moveTo([100, 100], 10, 10);
    
    // Check a frame after animation has started
    point.step(11);
    expect(point.position[0]).toBeGreaterThan(0);
    expect(point.position[1]).toBeGreaterThan(0);
    
    // Middle of animation
    point.step(15);
    expect(point.position[0]).toBeGreaterThan(0);
    expect(point.position[0]).toBeLessThan(100);
    expect(point.position[1]).toBeGreaterThan(0);
    expect(point.position[1]).toBeLessThan(100);
    
    // End of animation
    point.step(20);
    expect(point.position).toEqual([100, 100]);
  });

  it("should handle sequential animations", () => {
    point.moveTo([100, 200], 120, 120);
    point.moveTo([200, 400], 240, 120);
    
    // First animation not started yet
    point.step(100);
    expect(point.position).toEqual([0, 0]);
    
    // Start of first animation
    point.step(121);
    expect(point.position[0]).toBeGreaterThan(0);
    expect(point.position[1]).toBeGreaterThan(0);
    
    // Middle of first animation
    point.step(180);
    expect(point.position[0]).toBeGreaterThan(0);
    expect(point.position[0]).toBeLessThan(100);
    expect(point.position[1]).toBeGreaterThan(0);
    expect(point.position[1]).toBeLessThan(200);
    
    // End of first animation
    point.step(240);
    expect(point.position[0]).toBe(100);
    expect(point.position[1]).toBe(200);
    
    // Middle of second animation
    point.step(300);
    expect(point.position[0]).toBeGreaterThan(100);
    expect(point.position[0]).toBeLessThan(200);
    expect(point.position[1]).toBeGreaterThan(200);
    expect(point.position[1]).toBeLessThan(400);
    
    // End of second animation
    point.step(360);
    expect(point.position).toEqual([200, 400]);
  });

  it("should use custom easing function", () => {
    const linearEasing = (t: number) => t;
    point.setEasing(linearEasing);
    
    point.moveTo([100, 100], 10, 10);
    
    // Exactly middle of animation with linear easing
    point.step(15);
    expect(point.position[0]).toBeCloseTo(50, 0);
    expect(point.position[1]).toBeCloseTo(50, 0);
  });

  it("should handle frame 0 correctly", () => {
    point = new Point(50, 50);
    point.moveTo([100, 100], 10, 10);
    
    // Frame 0 should reset animations
    point.step(0);
    expect(point.position).toEqual([50, 50]);
  });

  it("should handle immediate movements", () => {
    point.moveTo([100, 100], 10, 1);
    
    point.step(11);
    expect(point.position[0]).toBeGreaterThan(0);
    
    point.step(11);
    expect(point.position).toEqual([100, 100]);
  });
}); 