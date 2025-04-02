import { Color, RGBA } from "./Color";
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock p5 instead of importing it
// This prevents the window not defined error
vi.mock("p5", () => {
  return {
    default: class P5 {
      // Basic mock implementation
    },
  };
});

// Mock p5.Color class that we will use for testing
class MockP5Color {
  levels: number[];

  constructor(r: number, g: number, b: number, a: number = 255) {
    this.levels = [r, g, b, a];
  }
}

// Mock p5 instance
const mockP5 = {
  color: (r: string | number, g?: number, b?: number, a?: number) => {
    if (typeof r === "string") {
      // Simple mock for string colors
      if (r === "#ff0000" || r === "red")
        return new MockP5Color(255, 0, 0, 255);
      if (r === "#00ff00" || r === "green")
        return new MockP5Color(0, 255, 0, 255);
      if (r === "#0000ff" || r === "blue")
        return new MockP5Color(0, 0, 255, 255);
      if (r === "rgba(255, 0, 0, 0.5)") return new MockP5Color(255, 0, 0, 127);
      return new MockP5Color(0, 0, 0, 255);
    }
    return new MockP5Color(r, g || 0, b || 0, a || 255);
  },
} as unknown as any;

describe("Color", () => {
  let color: Color;

  beforeEach(() => {
    color = new Color(255, 0, 0); // Red
  });

  it("should initialize with RGB values", () => {
    expect(color.r).toBe(255);
    expect(color.g).toBe(0);
    expect(color.b).toBe(0);
    expect(color.a).toBe(1);
  });

  it("should initialize with hex string", () => {
    const hexColor = new Color("#00ff00");
    expect(hexColor.r).toBe(0);
    expect(hexColor.g).toBe(255);
    expect(hexColor.b).toBe(0);
  });

  it("should initialize with array", () => {
    const arrayColor = new Color([0, 0, 255, 0.5]);
    expect(arrayColor.r).toBe(0);
    expect(arrayColor.g).toBe(0);
    expect(arrayColor.b).toBe(255);
    expect(arrayColor.a).toBe(0.5);
  });

  it("should generate correct string formats", () => {
    expect(color.rgbaString).toBe("rgba(255, 0, 0, 1)");
    expect(color.hexString).toBe("#ff0000");
  });

  it("should animate between colors", () => {
    color.change([0, 0, 255, 1] as RGBA, 60, 60); // Change to blue at frame 60

    // Before animation
    color.step(0);
    expect(color.rgba).toEqual([255, 0, 0, 1]);

    // During animation (frame 90 is halfway)
    color.step(90);
    expect(color.r).toBeLessThan(255);
    expect(color.r).toBeGreaterThan(0);
    expect(color.b).toBeGreaterThan(0);

    // End of animation
    color.step(120);
    expect(color.rgba).toEqual([0, 0, 255, 1]);
  });

  it("should handle sequential animations", () => {
    color.change([0, 255, 0, 1] as RGBA, 60, 60); // Red to green
    color.change([0, 0, 255, 1] as RGBA, 120, 60); // Green to blue

    // Start as red
    color.step(0);
    expect(color.rgba).toEqual([255, 0, 0, 1]);

    // End of first animation (green)
    color.step(120);
    expect(color.rgba).toEqual([0, 255, 0, 1]);

    // End of second animation (blue)
    color.step(180);
    expect(color.rgba).toEqual([0, 0, 255, 1]);
  });

  it("should handle string colors in change method", () => {
    color.change("#00ff00", 60, 60);

    color.step(120);
    expect(color.rgba).toEqual([0, 255, 0, 1]);
  });

  it("should handle rgba strings in change method", () => {
    color.change("rgba(0, 0, 255, 0.5)", 60, 60);

    color.step(120);
    expect(color.r).toBe(0);
    expect(color.b).toBe(255);
    expect(color.a).toBe(0.5);
  });

  it("should work with p5 instance", () => {
    const p5Color = new Color(255, 0, 0, 1, mockP5);

    // Get a p5.Color object
    const p5ColorObj = p5Color.p5Color();
    expect((p5ColorObj as unknown as MockP5Color).levels[0]).toBe(255);
    expect((p5ColorObj as unknown as MockP5Color).levels[1]).toBe(0);
    expect((p5ColorObj as unknown as MockP5Color).levels[2]).toBe(0);

    // Change color and ensure p5Color updates
    p5Color.change([0, 255, 0, 1] as RGBA, 60, 60);
    p5Color.step(120);

    const updatedP5Color = p5Color.p5Color();
    expect((updatedP5Color as unknown as MockP5Color).levels[0]).toBe(0);
    expect((updatedP5Color as unknown as MockP5Color).levels[1]).toBe(255);
  });

  it("should initialize from p5.Color", () => {
    const p5ColorObj = mockP5.color(0, 255, 0);
    const colorFromP5 = Color.fromP5Color(p5ColorObj as any, mockP5);

    expect(colorFromP5.r).toBe(0);
    expect(colorFromP5.g).toBe(255);
    expect(colorFromP5.b).toBe(0);
  });

  it("should initialize from another Color instance", () => {
    const originalColor = new Color(0, 0, 255);
    const newColor = new Color(originalColor);

    expect(newColor.rgba).toEqual([0, 0, 255, 1]);
  });

  it("should support both change and changeTo methods", () => {
    // Test changeTo as an alias for change
    color.changeTo([0, 255, 0, 1] as RGBA, 60, 60);
    color.step(120);
    expect(color.rgba).toEqual([0, 255, 0, 1]);
  });
});
