import {
  colord,
  extend,
  type RgbColor,
  type HslColor,
  type AnyColor as ColorInput,
} from "colord";
import mixPlugin from "colord/plugins/mix";
import a11yPlugin from "colord/plugins/a11y";
import harmoniesPlugin from "colord/plugins/harmonies";
import p5 from "p5";

// Extend colord with plugins
extend([mixPlugin, a11yPlugin, harmoniesPlugin]);

/**
 * Extended interface for p5.Color that exposes the levels property
 * which is used internally but not fully exposed in p5.js typings
 */
interface P5ColorWithLevels extends p5.Color {
  levels: [number, number, number, number];
}

/**
 * Color utilities for working with p5.js and colord together
 * Provides easy conversion between different color formats and advanced color operations
 */

/**
 * Creates a p5 color object from a colord-compatible color value
 * @param p - p5 instance
 * @param color - Any color format supported by colord (hex, rgb, hsl, etc.)
 * @param alpha - Optional alpha value (0-1)
 * @returns p5.Color object
 */
export const createP5Color = (
  p: p5,
  color: ColorInput,
  alpha?: number
): p5.Color => {
  const c = colord(color);
  const rgba = c.rgba;

  if (alpha !== undefined) {
    rgba.a = alpha;
  }

  return p.color(rgba.r, rgba.g, rgba.b, rgba.a * 255);
};

/**
 * Converts a p5 color to a colord instance
 * @param p5Color - p5.js color object
 * @returns colord instance
 */
export const p5ToColord = (p5Color: p5.Color): ReturnType<typeof colord> => {
  const colorWithLevels = p5Color as P5ColorWithLevels;

  return colord({
    r: colorWithLevels.levels[0],
    g: colorWithLevels.levels[1],
    b: colorWithLevels.levels[2],
    a: colorWithLevels.levels[3] / 255,
  });
};

/**
 * Parses a hex color string and returns RGBA values for p5.js
 * @param colorHex - Hex color string (e.g., "#RRGGBB")
 * @param alpha - Alpha value (0-255)
 * @returns Array of [r, g, b, a] values (0-255 range)
 */
export const parseColorToRGBA = (
  colorHex: string,
  alpha: number = 255
): number[] => {
  const c = colord(colorHex);
  const rgba = c.rgba;
  return [rgba.r, rgba.g, rgba.b, alpha];
};

/**
 * Creates a slightly darker version of the provided color
 * @param color - Any color format supported by colord
 * @param amount - Amount to darken (0-1)
 * @returns Darkened color in hex format
 */
export const darken = (color: ColorInput, amount: number = 0.1): string => {
  return colord(color).darken(amount).toHex();
};

/**
 * Creates a slightly lighter version of the provided color
 * @param color - Any color format supported by colord
 * @param amount - Amount to lighten (0-1)
 * @returns Lightened color in hex format
 */
export const lighten = (color: ColorInput, amount: number = 0.1): string => {
  return colord(color).lighten(amount).toHex();
};

/**
 * Creates a transparent version of a color
 * @param color - Any color format supported by colord
 * @param alpha - Alpha value (0-1)
 * @returns Color with modified transparency in rgba format
 */
export const transparentize = (color: ColorInput, alpha: number): string => {
  return colord(color).alpha(alpha).toRgbString();
};

/**
 * Blends two colors together
 * @param color1 - First color
 * @param color2 - Second color
 * @param ratio - Blend ratio (0 = all color1, 1 = all color2)
 * @returns Blended color in hex format
 */
export const blend = (
  color1: ColorInput,
  color2: ColorInput,
  ratio: number = 0.5
): string => {
  return colord(color1).mix(color2, ratio).toHex();
};

/**
 * Generates a complementary color
 * @param color - Source color
 * @returns Complementary color in hex format
 */
export const complementary = (color: ColorInput): string => {
  return colord(color).harmonies("complementary")[1].toHex();
};

/**
 * Generates a color scheme based on the input color
 * @param color - Source color
 * @param type - Type of harmony ("analogous", "complementary", "double-split-complementary",
 *               "rectangle", "split-complementary", "tetradic", "triadic")
 * @returns Array of colors in the requested scheme
 */
export const colorScheme = (
  color: ColorInput,
  type:
    | "analogous"
    | "complementary"
    | "double-split-complementary"
    | "rectangle"
    | "split-complementary"
    | "tetradic"
    | "triadic" = "analogous"
): string[] => {
  return colord(color)
    .harmonies(type)
    .map((c) => c.toHex());
};

/**
 * Checks if a color is considered dark (for determining text color)
 * @param color - Color to check
 * @returns True if the color is dark
 */
export const isDark = (color: ColorInput): boolean => {
  return colord(color).isDark();
};

/**
 * Converts a color to grayscale
 * @param color - Source color
 * @returns Grayscale version of the color in hex format
 */
export const grayscale = (color: ColorInput): string => {
  return colord(color).grayscale().toHex();
};

/**
 * Inverts a color
 * @param color - Source color
 * @returns Inverted color in hex format
 */
export const invert = (color: ColorInput): string => {
  return colord(color).invert().toHex();
};

/**
 * Gets contrasting text color (black or white) for a background color
 * @param bgColor - Background color
 * @returns Black or white hex color based on contrast
 */
export const getContrastingTextColor = (bgColor: ColorInput): string => {
  return colord(bgColor).isDark() ? "#ffffff" : "#000000";
};
