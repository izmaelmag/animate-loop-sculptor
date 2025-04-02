import { easeInOutCubic } from "../easing";
import p5 from "p5";

/**
 * RGBA color type as [r, g, b, a]
 * r, g, b ranges from 0-255
 * a ranges from 0-1
 */
export type RGBA = [number, number, number, number];

/**
 * Color change animation configuration
 */
interface ColorChangeConfig {
  targetColor: RGBA;
  startFrame: number;
  endFrame: number;
}

/**
 * Extended p5.Color interface that includes the levels property
 */
interface P5ColorWithLevels extends p5.Color {
  levels: number[];
}

/**
 * Helper function to check if the object is a p5.Color by checking for levels array
 * This is more reliable than instanceof when mocking
 */
function isP5Color(obj: any): obj is P5ColorWithLevels {
  return obj && Array.isArray(obj.levels) && obj.levels.length >= 3;
}

/**
 * Color class for animating color changes with frame-based timing
 * Integrates with p5.js colors
 */
export class Color {
  /** Current RGBA color values */
  private _color: RGBA;

  /** Initial RGBA color values */
  private _initialColor: RGBA;

  /** Queued color changes */
  private _changes: ColorChangeConfig[] = [];

  /** Easing function for animations */
  private _easing: (t: number) => number = easeInOutCubic;

  /** Reference to p5 instance if provided */
  private _p5Instance: p5 | null = null;

  /** Cached p5.Color object - will be recreated as needed */
  private _p5Color: p5.Color | null = null;

  /** Flag to track if color has changed since last p5Color generation */
  private _colorChanged: boolean = true;

  /**
   * Creates a new Color instance
   * @param color Initial color - can be RGBA values, hex string, string color, p5.Color, or another Color
   * @param g Green component (0-255) if using individual RGB values
   * @param b Blue component (0-255) if using individual RGB values
   * @param a Alpha component (0-1) if using individual RGB values
   * @param p5Instance Optional p5 instance for p5.Color integration
   */
  constructor(
    color: number | string | p5.Color | Color | RGBA,
    g?: number,
    b?: number,
    a: number = 1,
    p5Instance?: p5
  ) {
    if (p5Instance) {
      this._p5Instance = p5Instance;
    }

    // Initialize with default black
    this._color = [0, 0, 0, 1];

    // Handle different color input formats
    if (
      typeof color === "number" &&
      typeof g === "number" &&
      typeof b === "number"
    ) {
      // RGB/RGBA values
      this._color = [
        this._clamp(color, 0, 255),
        this._clamp(g, 0, 255),
        this._clamp(b, 0, 255),
        this._clamp(a, 0, 1),
      ];
    } else if (typeof color === "string") {
      // String color (hex, rgb, rgba, etc.)
      this._color = this._parseColorString(color);
    } else if (isP5Color(color)) {
      // p5.Color object
      this._color = this._parseP5Color(color);
    } else if (color instanceof Color) {
      // Another Color instance
      this._color = [...color.rgba];
      if (p5Instance === undefined && color._p5Instance) {
        this._p5Instance = color._p5Instance;
      }
    } else if (Array.isArray(color) && color.length >= 3) {
      // RGBA array
      this._color = [
        this._clamp(color[0], 0, 255),
        this._clamp(color[1], 0, 255),
        this._clamp(color[2], 0, 255),
        this._clamp(color.length >= 4 ? color[3] : 1, 0, 1),
      ];
    }

    this._initialColor = [...this._color];
  }

  /**
   * Get current RGBA color values
   */
  get rgba(): RGBA {
    return [...this._color];
  }

  /**
   * Get red component (0-255)
   */
  get r(): number {
    return this._color[0];
  }

  /**
   * Get green component (0-255)
   */
  get g(): number {
    return this._color[1];
  }

  /**
   * Get blue component (0-255)
   */
  get b(): number {
    return this._color[2];
  }

  /**
   * Get alpha component (0-1)
   */
  get a(): number {
    return this._color[3];
  }

  /**
   * Get color as CSS rgba string
   */
  get rgbaString(): string {
    return `rgba(${Math.round(this._color[0])}, ${Math.round(
      this._color[1]
    )}, ${Math.round(this._color[2])}, ${this._color[3]})`;
  }

  /**
   * Get color as CSS hex string
   */
  get hexString(): string {
    const r = Math.round(this._color[0]).toString(16).padStart(2, "0");
    const g = Math.round(this._color[1]).toString(16).padStart(2, "0");
    const b = Math.round(this._color[2]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }

  /**
   * Get as p5.Color object
   * @param p5Instance p5 instance to use if not already provided
   */
  public p5Color(p5Instance?: p5): p5.Color {
    const instance = p5Instance || this._p5Instance;

    if (!instance) {
      throw new Error(
        "No p5 instance provided. Pass a p5 instance to the constructor or to this method."
      );
    }

    // Update cached p5.Color if color has changed
    if (this._colorChanged || !this._p5Color || this._p5Instance !== instance) {
      this._p5Instance = instance;
      this._p5Color = instance.color(
        Math.round(this._color[0]),
        Math.round(this._color[1]),
        Math.round(this._color[2]),
        this._color[3] * 255 // p5 uses 0-255 for alpha
      );
      this._colorChanged = false;
    }

    return this._p5Color;
  }

  /**
   * Create a Color instance from hex string
   * @param hex Color in hex format (e.g., #ff0000)
   * @param alpha Optional alpha value (0-1)
   * @param p5Instance Optional p5 instance
   */
  static fromHex(hex: string, alpha: number = 1, p5Instance?: p5): Color {
    // Remove # if present
    hex = hex.replace(/^#/, "");

    // Parse hex values
    let r, g, b;
    if (hex.length === 3) {
      // Short form #RGB
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else {
      // Long form #RRGGBB
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }

    return new Color(r, g, b, alpha, p5Instance);
  }

  /**
   * Create a Color instance from p5.Color
   * @param p5Color p5.Color object
   * @param p5Instance Optional p5 instance (will try to extract from color if not provided)
   */
  static fromP5Color(p5Color: p5.Color, p5Instance?: p5): Color {
    const color = new Color(0, 0, 0, 1, p5Instance);
    color._color = color._parseP5Color(p5Color);
    color._initialColor = [...color._color];
    return color;
  }

  /**
   * Schedule color change animation
   * @param target Target color (can be string, p5.Color, Color, RGBA array, or r value)
   * @param g Green component or start frame if target is not a number
   * @param b Blue component or duration if target is not a number
   * @param a Alpha component if using individual RGBA components
   * @param startFrame Frame when change should start if using individual RGBA components
   * @param duration Duration of change in frames if using individual RGBA components
   */
  public change(
    target: string | p5.Color | Color | RGBA | number,
    g: number,
    b?: number,
    a?: number,
    startFrame?: number,
    duration?: number
  ): void {
    let targetColor: RGBA;
    let changeStartFrame: number;
    let changeDuration: number;

    // Handle different parameter formats
    if (typeof target === "number") {
      // Individual RGBA components
      targetColor = [
        this._clamp(target, 0, 255),
        this._clamp(g as number, 0, 255),
        this._clamp(b || 0, 0, 255),
        this._clamp(a || 1, 0, 1),
      ];
      changeStartFrame = startFrame || 0;
      changeDuration = duration || 1;
    } else if (typeof target === "string") {
      // String color
      targetColor = this._parseColorString(target);
      changeStartFrame = g;
      changeDuration = b || 1;
    } else if (isP5Color(target)) {
      // p5.Color
      targetColor = this._parseP5Color(target);
      changeStartFrame = g;
      changeDuration = b || 1;
    } else if (target instanceof Color) {
      // Another Color instance
      targetColor = [...target.rgba];
      changeStartFrame = g;
      changeDuration = b || 1;
    } else if (Array.isArray(target)) {
      // RGBA array
      targetColor = [
        this._clamp(target[0], 0, 255),
        this._clamp(target[1], 0, 255),
        this._clamp(target[2], 0, 255),
        this._clamp(target.length >= 4 ? target[3] : 1, 0, 1),
      ];
      changeStartFrame = g;
      changeDuration = b || 1;
    } else {
      // Fallback to current color
      console.warn("Color: Invalid target color format");
      targetColor = [...this._color];
      changeStartFrame = g;
      changeDuration = b || 1;
    }

    if (changeDuration <= 0) {
      console.warn("Color: Animation duration must be positive");
      changeDuration = 1;
    }

    const changeConfig: ColorChangeConfig = {
      targetColor,
      startFrame: changeStartFrame,
      endFrame: changeStartFrame + changeDuration,
    };

    this._changes.push(changeConfig);
  }

  /**
   * Alias for changeTo
   */
  public changeTo(
    target: string | p5.Color | Color | RGBA | number,
    g: number,
    b?: number,
    a?: number,
    startFrame?: number,
    duration?: number
  ): void {
    this.change(target, g, b, a, startFrame, duration);
  }

  /**
   * Updates the color based on the current frame
   * @param frame Current animation frame
   */
  public step(frame: number): void {
    // For frame 0, reset to initial color but don't modify animation sequence
    if (frame === 0) {
      if (!this._colorEquals(this._color, this._initialColor)) {
        this._color = [...this._initialColor];
        this._colorChanged = true;
      }
      return;
    }

    // Create a working copy of changes to avoid modifying the original sequence
    let pendingChanges = [...this._changes];

    // Reset color to initial for fresh calculation
    const initialColor = [...this._initialColor];

    // Find all changes that should be complete by this frame
    let lastCompletedChange: ColorChangeConfig | null = null;

    for (let i = 0; i < pendingChanges.length; i++) {
      const change = pendingChanges[i];
      if (frame >= change.endFrame) {
        lastCompletedChange = change;
      } else {
        break;
      }
    }

    // If we have completed changes, use the last one's target
    let newColor: RGBA = initialColor as RGBA;

    if (lastCompletedChange) {
      newColor = [...lastCompletedChange.targetColor];

      // Remove all completed changes from our working copy
      pendingChanges = pendingChanges.filter((c) => frame < c.endFrame);
    }

    // Check if we're in the middle of a change
    if (pendingChanges.length > 0) {
      const currentChange = pendingChanges[0];

      if (frame >= currentChange.startFrame && frame < currentChange.endFrame) {
        // We're in this change - calculate color
        const rawProgress =
          (frame - currentChange.startFrame) /
          (currentChange.endFrame - currentChange.startFrame);
        const progress = this._easing(this._clamp(rawProgress, 0, 1));

        // Get starting color - either last completed change's target or initial color
        const startColor = lastCompletedChange
          ? [...lastCompletedChange.targetColor]
          : initialColor;

        // Update each color component through interpolation
        newColor = [
          this._lerp(startColor[0], currentChange.targetColor[0], progress),
          this._lerp(startColor[1], currentChange.targetColor[1], progress),
          this._lerp(startColor[2], currentChange.targetColor[2], progress),
          this._lerp(startColor[3], currentChange.targetColor[3], progress),
        ];
      }
    }

    // Update color if it has changed
    if (!this._colorEquals(this._color, newColor)) {
      this._color = newColor;
      this._colorChanged = true;
    }
  }

  /**
   * Sets a custom easing function for animations
   * @param easing The easing function to use (takes and returns a value from 0 to 1)
   */
  public setEasing(easing: (t: number) => number): void {
    this._easing = easing;
  }

  /**
   * Clears all scheduled changes
   */
  public clearChanges(): void {
    this._changes = [];
  }

  /**
   * Parse a color string (hex, rgb, rgba, etc.)
   * @param colorString Color string to parse
   * @returns RGBA values
   */
  private _parseColorString(colorString: string): RGBA {
    // If we have a p5 instance, use it to parse the color
    if (this._p5Instance) {
      return this._parseP5Color(this._p5Instance.color(colorString));
    }

    // Simple hex parser for when p5 is unavailable
    if (colorString.startsWith("#")) {
      return this._parseHexColor(colorString);
    }

    // Handle rgba strings
    if (colorString.startsWith("rgba(")) {
      return this._parseRgbaString(colorString);
    }

    // Handle rgb strings
    if (colorString.startsWith("rgb(")) {
      const rgb = this._parseRgbaString(colorString);
      rgb[3] = 1; // Set alpha to 1
      return rgb;
    }

    // For other formats, create a temporary canvas to parse the color
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = colorString;
        ctx.fillRect(0, 0, 1, 1);
        const data = ctx.getImageData(0, 0, 1, 1).data;
        return [data[0], data[1], data[2], data[3] / 255];
      }
    } catch (e) {
      console.warn(`Color: Failed to parse color string: ${colorString}`);
    }

    // Fallback to black
    return [0, 0, 0, 1];
  }

  /**
   * Parse a hex color string
   * @param hex Hex color string (e.g., #ff0000)
   * @returns RGBA values
   */
  private _parseHexColor(hex: string): RGBA {
    // Remove # if present
    hex = hex.replace(/^#/, "");

    let r,
      g,
      b,
      a = 1;
    if (hex.length === 3) {
      // Short form #RGB
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 4) {
      // Short form #RGBA
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
      a = parseInt(hex[3] + hex[3], 16) / 255;
    } else if (hex.length === 6) {
      // Long form #RRGGBB
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else if (hex.length === 8) {
      // Long form #RRGGBBAA
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      a = parseInt(hex.substring(6, 8), 16) / 255;
    } else {
      // Invalid hex, fallback to black
      r = 0;
      g = 0;
      b = 0;
    }

    return [r, g, b, a];
  }

  /**
   * Parse an rgba string
   * @param rgba RGBA string (e.g., rgba(255, 0, 0, 1))
   * @returns RGBA values
   */
  private _parseRgbaString(rgba: string): RGBA {
    const parts = rgba.match(/\d+(\.\d+)?/g);
    if (parts && parts.length >= 3) {
      const r = parseInt(parts[0], 10);
      const g = parseInt(parts[1], 10);
      const b = parseInt(parts[2], 10);
      const a = parts.length >= 4 ? parseFloat(parts[3]) : 1;
      return [r, g, b, a];
    }
    return [0, 0, 0, 1];
  }

  /**
   * Parse a p5.Color object
   * @param p5Color p5.Color object
   * @returns RGBA values
   */
  private _parseP5Color(p5Color: P5ColorWithLevels): RGBA {
    return [
      p5Color.levels[0],
      p5Color.levels[1],
      p5Color.levels[2],
      p5Color.levels[3] / 255, // p5 uses 0-255 for alpha
    ];
  }

  /**
   * Check if two colors are equal
   * @param a First color
   * @param b Second color
   * @returns True if colors are equal
   */
  private _colorEquals(a: RGBA, b: RGBA): boolean {
    return (
      Math.abs(a[0] - b[0]) < 0.001 &&
      Math.abs(a[1] - b[1]) < 0.001 &&
      Math.abs(a[2] - b[2]) < 0.001 &&
      Math.abs(a[3] - b[3]) < 0.001
    );
  }

  /**
   * Linear interpolation between two values
   * @param a Start value
   * @param b End value
   * @param t Progress (0 to 1)
   * @returns Interpolated value
   */
  private _lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Clamps a value between min and max
   * @param value Value to clamp
   * @param min Minimum value
   * @param max Maximum value
   * @returns Clamped value
   */
  private _clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
  }
}
