import { describe, it, expect, beforeEach } from "vitest";
import { Line } from "./Line";
import { linear } from "../easing";

describe("Line", () => {
  let line: Line;
  const pointA = [100, 200] as [number, number];
  const pointB = [300, 400] as [number, number];

  beforeEach(() => {
    line = new Line(pointA, pointB);
  });

  describe("initialization", () => {
    it("should initialize with correct points", () => {
      expect(line.a).toEqual(pointA);
      expect(line.b).toEqual(pointB);
      expect(line.current).toEqual(pointA);
    });

    it("should initialize with correct state", () => {
      expect(line.isDisconnected).toBe(true);
      expect(line.isConnected).toBe(false);
      expect(line.isConnecting).toBe(false);
      expect(line.isDisconnecting).toBe(false);
      expect(line.animationProgress).toBe(0);
    });

    it("should handle reset at frame 0 with proper point copying", () => {
      const pointA = [100, 200] as [number, number];
      const line = new Line(pointA, [300, 400]);
      
      // Modify the original array
      pointA[0] = 150;
      
      // Step should use the copied value, not the modified reference
      line.step(0);
      expect(line.current[0]).toBe(100);
    });
  });

  describe("setPoints", () => {
    it("should update points correctly", () => {
      const newA = [50, 60] as [number, number];
      const newB = [70, 80] as [number, number];
      line.setPoints(newA, newB);
      expect(line.a).toEqual(newA);
      expect(line.b).toEqual(newB);
    });

    it("should update current point in disconnected state when points change", () => {
      const line = new Line([100, 200], [300, 400]);
      
      // Should be in disconnected state
      expect(line.isDisconnected).toBe(true);
      
      // Update points
      line.setPoints([150, 250], [350, 450]);
      
      // Current point should update to new a
      expect(line.current).toEqual([150, 250]);
    });
  });

  describe("setEasing", () => {
    it("should update easing function", () => {
      line.setEasing(linear);
      // Test indirectly by seeing if animation uses linear easing
      line.connection(0, 10);
      line.step(5);
      expect(line.animationProgress).toBeCloseTo(0.5, 2);
    });
  });

  describe("animation states", () => {
    it("should transition from disconnected to connecting to connected", () => {
      line.connection(10, 10);
      
      // Before animation starts
      line.step(5);
      expect(line.isDisconnected).toBe(true);
      expect(line.isConnecting).toBe(false);
      
      // During connection
      line.step(15);
      expect(line.isDisconnected).toBe(false);
      expect(line.isConnecting).toBe(true);
      expect(line.isConnected).toBe(false);
      
      // After connection completes
      line.step(25);
      expect(line.isConnecting).toBe(false);
      expect(line.isConnected).toBe(true);
    });

    it("should transition from connected to disconnecting to disconnected", () => {
      // First connect the line
      line.connection(0, 10);
      line.step(15);
      expect(line.isConnected).toBe(true);
      
      // Set up disconnection
      line.disconnection(20, 10);
      
      // Before disconnection
      line.step(15);
      expect(line.isConnected).toBe(true);
      expect(line.isDisconnecting).toBe(false);
      
      // During disconnection
      line.step(25);
      expect(line.isConnected).toBe(false);
      expect(line.isDisconnecting).toBe(true);
      expect(line.isDisconnected).toBe(false);
      
      // After disconnection
      line.step(35);
      expect(line.isDisconnecting).toBe(false);
      expect(line.isDisconnected).toBe(true);
    });

    it("should handle transition from connecting to disconnecting", () => {
      const line = new Line([100, 200], [300, 400]);
      
      // Start connecting
      line.connection(10, 20);
      line.step(20); // Mid-connection
      
      // Start disconnecting before connection completes
      line.disconnection(25, 10);
      line.step(26);
      
      // Should now be disconnecting
      expect(line.isDisconnecting).toBe(true);
      expect(line.isConnecting).toBe(false);
    });

    it("should report isAnimated correctly", () => {
      line.connection(10, 10);
      line.disconnection(30, 10);
      
      // Before animation
      line.step(5);
      expect(line.isAnimated).toBe(false);
      
      // During connection
      line.step(15);
      expect(line.isAnimated).toBe(true);
      
      // Between animations
      line.step(25);
      expect(line.isAnimated).toBe(false);
      
      // During disconnection
      line.step(35);
      expect(line.isAnimated).toBe(true);
      
      // After all animations
      line.step(45);
      expect(line.isAnimated).toBe(false);
    });
  });

  describe("animation timing", () => {
    it("should handle connection timing correctly", () => {
      line.connection(10, 20);
      
      line.step(10); // Start of animation
      expect(line.animationProgress).toBeCloseTo(0, 2);
      
      line.step(20); // Middle of animation
      expect(line.animationProgress).toBeGreaterThan(0);
      expect(line.animationProgress).toBeLessThan(1);
      
      line.step(30); // End of animation
      expect(line.animationProgress).toBeCloseTo(1, 2);
    });

    it("should handle disconnection timing correctly", () => {
      // First connect the line
      line.connection(0, 10);
      line.step(15);
      
      line.disconnection(20, 20);
      
      line.step(20); // Start of disconnection
      expect(line.animationProgress).toBeCloseTo(1, 2);
      
      line.step(30); // Middle of disconnection
      expect(line.animationProgress).toBeGreaterThan(0);
      expect(line.animationProgress).toBeLessThan(1);
      
      line.step(40); // End of disconnection
      expect(line.animationProgress).toBeCloseTo(0, 2);
    });

    it("should handle overlapping animations properly", () => {
      line.connection(10, 20);
      line.disconnection(20, 20);
      
      // Connection should take precedence
      line.step(15);
      expect(line.isConnecting).toBe(true);
      expect(line.isDisconnecting).toBe(false);
      
      // Disconnection should start after connection
      line.step(25);
      expect(line.isConnecting).toBe(false);
      expect(line.isDisconnecting).toBe(true);
    });
  });

  describe("point calculation", () => {
    it("should calculate points on line correctly", () => {
      expect(line.getPointOnLine(0)).toEqual(pointA);
      expect(line.getPointOnLine(1)).toEqual(pointB);
      
      const midpoint = [
        pointA[0] + (pointB[0] - pointA[0]) * 0.5,
        pointA[1] + (pointB[1] - pointA[1]) * 0.5
      ];
      expect(line.getPointOnLine(0.5)).toEqual(midpoint);
    });

    it("should update current point based on animation progress", () => {
      line.connection(0, 10);
      
      line.step(0);
      expect(line.current).toEqual(pointA);
      
      line.step(5);
      const expectedPoint = line.getPointOnLine(line.animationProgress);
      expect(line.current).toEqual(expectedPoint);
      
      line.step(15);
      expect(line.current).toEqual(pointB);
    });
  });

  describe("edge cases", () => {
    it("should handle step(0) correctly", () => {
      line.connection(10, 10);
      line.step(15); // Move forward in animation
      
      line.step(0); // Reset
      expect(line.animationProgress).toBe(0);
      expect(line.current).toEqual(pointA);
    });

    it("should handle point changes during animation", () => {
      line.connection(0, 10);
      line.step(5);
      
      const newA = [50, 60] as [number, number];
      const newB = [70, 80] as [number, number];
      line.setPoints(newA, newB);
      
      // Animation should continue with new points
      expect(line.a).toEqual(newA);
      expect(line.b).toEqual(newB);
      
      // Current point should update to match new points with current progress
      line.step(6);
      const expectedPoint = line.getPointOnLine(line.animationProgress);
      expect(line.current).toEqual(expectedPoint);
    });

    it("should handle multiple connection calls", () => {
      line.connection(0, 10);
      line.step(5);
      
      // Change connection timing
      line.connection(10, 5);
      
      // Should use the new timing
      line.step(12);
      expect(line.isConnecting).toBe(true);
    });

    it("should handle invalid durations", () => {
      // Should not throw error with zero or negative duration
      expect(() => line.connection(0, 0)).not.toThrow();
      expect(() => line.disconnection(0, -5)).not.toThrow();
    });

    it("should clamp animation progress between 0 and 1", () => {
      line.connection(0, 10);
      
      line.step(15); // Past end of animation
      expect(line.animationProgress).toBe(1);
      
      line.disconnection(20, 10);
      line.step(35); // Past end of disconnection
      expect(line.animationProgress).toBe(0);
    });
  });
}); 