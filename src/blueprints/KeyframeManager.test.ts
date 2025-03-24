// Vitest test for ./KFManager.ts
import { describe, it, expect, beforeEach } from "vitest";
import { KFManager } from "./KeyframeManager";

describe("KFManager", () => {
  // Test store type
  type TestStore = {
    x: number;
    y: number;
    z: number;
  };

  let kfManager: KFManager<TestStore>;

  beforeEach(() => {
    // Fresh instance for each test
    kfManager = new KFManager<TestStore>({ x: 0, y: 0, z: 0 });
  });

  describe("initialization", () => {
    it("should create a manager with initial store", () => {
      expect(kfManager.store).toEqual({ x: 0, y: 0, z: 0 });
    });
  });

  describe("creating sequences", () => {
    it("should create a simple sequence", () => {
      kfManager.createSequence("x", [
        { frame: 0, value: 0 },
        { frame: 10, value: 100 },
      ]);

      const result = kfManager.animate(5);
      expect(result.x).toBe(50); // Linear interpolation by default
    });

    it("should handle sequences with wait periods", () => {
      kfManager.createSequence("x", [
        { frame: 0, value: 0 },
        { wait: 10 },
        { frame: 10, value: 100 },
      ]);

      // With wait period of 10, the second keyframe is effectively at frame 20
      const result = kfManager.animate(15);

      // Frame 15 is 75% of the way from frame 0 to frame 20
      expect(result.x).toBe(75); // 75% progress between 0 and 100
    });

    it("should apply easing functions", () => {
      // Define a simple easing function for predictable testing
      const easingFn = (t: number) => t * t; // Simple quadratic easing

      kfManager.createSequence("x", [
        { frame: 0, value: 0 },
        { frame: 10, value: 100, easingFn },
      ]);

      const result = kfManager.animate(5);
      // Quadratic easing at 0.5 should be 0.25
      expect(result.x).toBe(25); // 0 + (100 - 0) * 0.25
    });
  });

  describe("animate method", () => {
    it("should use the first keyframe value before animation starts", () => {
      kfManager.createSequence("x", [
        { frame: 10, value: 50 },
        { frame: 20, value: 100 },
      ]);

      const result = kfManager.animate(5);
      expect(result.x).toBe(50); // First keyframe value
    });

    it("should maintain final values after last keyframe", () => {
      kfManager.createSequence("x", [
        { frame: 0, value: 0 },
        { frame: 10, value: 100 },
      ]);

      const result = kfManager.animate(15);
      expect(result.x).toBe(100); // Final value
    });

    it("should handle multiple properties independently", () => {
      kfManager.createSequence("x", [
        { frame: 0, value: 0 },
        { frame: 10, value: 100 },
      ]);

      kfManager.createSequence("y", [
        { frame: 5, value: 50 },
        { frame: 15, value: 150 },
      ]);

      const result = kfManager.animate(10);
      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
    });
  });

  describe("overwrite method", () => {
    it("should directly change store values", () => {
      kfManager.createSequence("x", [
        { frame: 0, value: 0 },
        { frame: 10, value: 100 },
      ]);

      kfManager.animate(5); // x should be 50
      kfManager.overwrite("x", 75);

      expect(kfManager.store.x).toBe(75);
    });
  });

  describe("nested objects", () => {
    // Test store with nested objects
    type NestedTestStore = {
      point: {
        x: number;
        y: number;
        r: number;
      };
      options: {
        speed: number;
        delay: number;
      };
      value: number;
    };

    let nestedKfManager: KFManager<NestedTestStore>;

    beforeEach(() => {
      // Fresh instance with nested objects for each test
      nestedKfManager = new KFManager<NestedTestStore>({
        point: {
          x: 0,
          y: 0,
          r: 10,
        },
        options: {
          speed: 1,
          delay: 0,
        },
        value: 0,
      });
    });

    it("should animate nested properties with dot notation", () => {
      nestedKfManager.createSequence("point.x", [
        { frame: 0, value: 0 },
        { frame: 10, value: 100 },
      ]);

      nestedKfManager.createSequence("point.r", [
        { frame: 0, value: 10 },
        { frame: 10, value: 30 },
      ]);

      const result = nestedKfManager.animate(5);

      expect(result.point.x).toBe(50); // Linear interpolation by default
      expect(result.point.y).toBe(0); // Unchanged
      expect(result.point.r).toBe(20); // Linear interpolation
    });

    it("should handle deeply nested properties", () => {
      nestedKfManager.createSequence("options.speed", [
        { frame: 0, value: 1 },
        { frame: 10, value: 5 },
      ]);

      const result = nestedKfManager.animate(5);

      expect(result.options.speed).toBe(3); // Linear interpolation
      expect(result.options.delay).toBe(0); // Unchanged
    });

    it("should allow mixing top-level and nested properties", () => {
      nestedKfManager.createSequence("value", [
        { frame: 0, value: 0 },
        { frame: 10, value: 100 },
      ]);

      nestedKfManager.createSequence("point.r", [
        { frame: 0, value: 10 },
        { frame: 10, value: 30 },
      ]);

      const result = nestedKfManager.animate(5);

      expect(result.value).toBe(50); // Linear interpolation
      expect(result.point.r).toBe(20); // Linear interpolation
    });

    it("should handle overwrite with nested properties", () => {
      nestedKfManager.createSequence("point.r", [
        { frame: 0, value: 10 },
        { frame: 10, value: 30 },
      ]);

      nestedKfManager.animate(5); // point.r should be 20
      nestedKfManager.overwrite("point.r", 15);

      expect(nestedKfManager.store.point.r).toBe(15); // Direct overwrite
    });
  });
});
