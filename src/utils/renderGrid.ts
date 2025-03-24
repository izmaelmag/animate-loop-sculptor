import p5 from "p5";
import { parseColorToRGBA, transparentize, darken, lighten } from "./colorUtils";

/**
 * Default values for grid rendering
 */
const DEFAULT_VALUES = {
  SCALE: 4,
  MAIN_COLOR: "#ffffff",
  SECONDARY_COLOR: "#ffffff",
  MAIN_OPACITY: 1,
  SECONDARY_OPACITY: 0.25,
  MAIN_WIDTH: 1,
  SECONDARY_WIDTH: 1,
  TEXT_SIZE: 11,
  SUBGRID_COLOR: "#ffffff",
  SUBGRID_OPACITY: 0.1,
  SUBGRID_WIDTH: 0.5,
  ANIMATION_FRAMES: 60,
  STAGGER: 5,
  DELAY: 20,
};

/**
 * Interface for grid rendering options
 * @interface GridOptions
 */
export interface GridOptions {
  /** p5 instance */
  p: p5;
  /** Center position of the grid */
  center?: { x: number; y: number };
  /** Scale factor for grid size */
  scale?: number;
  /** Whether to show secondary grid lines */
  showSecondary?: boolean;
  /** Whether to show main grid lines */
  showMain?: boolean;
  /** Color for main grid lines */
  mainColor?: string;
  /** Color for secondary grid lines */
  secondaryColor?: string;
  /** Opacity for main grid lines (0-1) */
  mainOpacity?: number;
  /** Opacity for secondary grid lines (0-1) */
  secondaryOpacity?: number;
  /** Whether to show unit numbers */
  showUnits?: boolean;
  /** Whether to show tick marks */
  showTicks?: boolean;
  /** Whether to invert Y axis */
  invertY?: boolean;
  /** Whether to invert X axis */
  invertX?: boolean;
  /** Width of main grid lines */
  mainWidth?: number;
  /** Width of secondary grid lines */
  secondaryWidth?: number;
  /** Size of text labels */
  textSize?: number;
  /** Number of subgrid divisions per unit */
  subgrid?: number;
  /** Color for subgrid lines */
  subgridColor?: string;
  /** Opacity for subgrid lines (0-1) */
  subgridOpacity?: number;
  /** Width of subgrid lines */
  subgridWidth?: number;
  /** Whether to animate grid drawing */
  animated?: boolean;
  /** Length of animation in frames */
  animationFramesLength?: number;
  /** Current frame number for animation */
  currentGlobalFrame?: number;
  /** Stagger factor for line animation */
  stagger?: number;
  /** Initial delay before animation starts */
  delay?: number;
}

/**
 * Ease-out-quart function for smooth animation with stronger deceleration
 * @param x - Input value (0-1)
 * @returns Eased value (0-1)
 */
const easeOutQuart = (x: number): number => {
  return x === 1 ? 1 : 1 - Math.pow(1 - x, 4);
};

/**
 * Calculates the animation progress for a line based on its index and current frame
 * @param index - Line index
 * @param currentFrame - Current animation frame
 * @param delay - Animation start delay
 * @param stagger - Stagger between lines
 * @param animationFramesLength - Total animation length
 * @param animated - Whether animation is enabled
 * @returns Progress value (0-1)
 */
const getLineProgress = (
  index: number,
  currentFrame: number,
  delay: number,
  stagger: number,
  animationFramesLength: number,
  animated: boolean
): number => {
  if (!animated) return 1;
  if (currentFrame < delay) return 0;

  const animFrame = currentFrame - delay;
  const lineDelay = index * stagger;

  if (animFrame < lineDelay) return 0;

  const linearProgress =
    (animFrame - lineDelay) / (animationFramesLength - lineDelay);
  return Math.min(1, easeOutQuart(Math.min(1, linearProgress)));
};

/**
 * Determines if a line should be drawn based on animation state
 * @param index - Line index
 * @param currentFrame - Current animation frame
 * @param delay - Animation start delay
 * @param stagger - Stagger between lines
 * @param animated - Whether animation is enabled
 * @returns Whether the line should be drawn
 */
const shouldDrawLine = (
  index: number,
  currentFrame: number,
  delay: number,
  stagger: number,
  animated: boolean
): boolean => {
  if (!animated) return true;
  if (currentFrame < delay) return false;

  const animFrame = currentFrame - delay;
  const lineDelay = index * stagger;

  return animFrame >= lineDelay;
};

/**
 * Calculates text opacity for animated grid labels
 * @param animated - Whether animation is enabled
 * @param currentFrame - Current animation frame
 * @param delay - Animation start delay
 * @param animationFramesLength - Total animation length
 * @returns Alpha value (0-255)
 */
const getTextAlpha = (
  animated: boolean,
  currentFrame: number,
  delay: number,
  animationFramesLength: number
): number => {
  if (!animated) return 255;
  if (currentFrame < delay) return 0;

  const fadeProgress = ((currentFrame - delay) * 2) / animationFramesLength;
  return Math.min(1, fadeProgress) * 255;
};

/**
 * Draws grid lines (main, secondary, or subgrid)
 * @param graphics - p5.Graphics object to draw on
 * @param isHorizontal - Whether to draw horizontal lines
 * @param numLines - Number of lines to draw
 * @param unitSize - Size of grid unit
 * @param offset - Offset from origin
 * @param centerX - X coordinate of grid center
 * @param centerY - Y coordinate of grid center
 * @param width - Width of graphics canvas
 * @param height - Height of graphics canvas
 * @param lineWeight - Weight of lines
 * @param color - Color of lines
 * @param skipCenter - Whether to skip the center line
 * @param animated - Whether animation is enabled
 * @param currentFrame - Current animation frame
 * @param delay - Animation start delay
 * @param stagger - Stagger between lines
 * @param animationFramesLength - Total animation length
 * @param subgridFactor - Factor for subgrid (if drawing subgrid)
 * @param skipMain - For subgrid, whether to skip lines that match main grid
 */
const drawGridLines = (
  graphics: p5.Graphics,
  isHorizontal: boolean,
  numLines: number,
  unitSize: number,
  offset: number,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  lineWeight: number,
  color: number[],
  skipCenter: boolean = false,
  animated: boolean = false,
  currentFrame: number = 0,
  delay: number = 0,
  stagger: number = 0,
  animationFramesLength: number = 60,
  subgridFactor: number = 1,
  skipMain: boolean = false
): void => {
  graphics.strokeWeight(lineWeight);
  graphics.stroke(color[0], color[1], color[2], color[3]);

  const totalLines = numLines * subgridFactor;
  const actualUnitSize = unitSize / subgridFactor;

  for (let i = 0; i < totalLines; i++) {
    // Skip main grid lines if drawing subgrid
    if (skipMain && i % subgridFactor === 0) continue;

    if (isHorizontal) {
      const y = i * actualUnitSize + offset;
      // Skip center line if required
      if (skipCenter && y === centerY) continue;

      if (shouldDrawLine(i, currentFrame, delay, stagger, animated)) {
        const progress = getLineProgress(
          i,
          currentFrame,
          delay,
          stagger,
          animationFramesLength,
          animated
        );
        if (progress > 0) {
          const endX = width * progress;
          graphics.line(0, y, endX, y);
        }
      }
    } else {
      const x = i * actualUnitSize + offset;
      // Skip center line if required
      if (skipCenter && x === centerX) continue;

      if (shouldDrawLine(i, currentFrame, delay, stagger, animated)) {
        const progress = getLineProgress(
          i,
          currentFrame,
          delay,
          stagger,
          animationFramesLength,
          animated
        );
        if (progress > 0) {
          const endY = height * progress;
          graphics.line(x, 0, x, endY);
        }
      }
    }
  }
};

/**
 * Draws unit labels and tick marks on the grid axes
 * @param graphics - p5.Graphics object to draw on
 * @param centerX - X coordinate of grid center
 * @param centerY - Y coordinate of grid center
 * @param unitSize - Size of grid unit
 * @param width - Width of graphics canvas
 * @param height - Height of graphics canvas
 * @param textSize - Size of text labels
 * @param showTicks - Whether to show tick marks
 * @param invertX - Whether to invert X axis
 * @param invertY - Whether to invert Y axis
 * @param color - Color array [r,g,b,a]
 * @param mainWidth - Width of main grid lines
 * @param textAlpha - Alpha value for text
 */
const drawUnitLabels = (
  graphics: p5.Graphics,
  centerX: number,
  centerY: number,
  unitSize: number,
  width: number,
  height: number,
  textSize: number,
  showTicks: boolean,
  invertX: boolean,
  invertY: boolean,
  color: number[],
  mainWidth: number,
  textAlpha: number
): void => {
  // Configure text appearance
  graphics.textAlign(graphics.CENTER, graphics.CENTER);
  graphics.textSize(textSize);
  graphics.textFont("Courier New");
  graphics.fill(color[0], color[1], color[2], textAlpha);

  // Set stroke color for tick marks
  graphics.strokeWeight(1);
  graphics.stroke(color[0], color[1], color[2], textAlpha);

  // Calculate grid details
  const maxUnitsX = Math.ceil(width / unitSize) + 1;
  const maxUnitsY = Math.ceil(height / unitSize) + 1;
  const leftEdgeUnit = -Math.ceil(centerX / unitSize);
  const topEdgeUnit = invertY
    ? Math.ceil(centerY / unitSize)
    : -Math.ceil(centerY / unitSize);
  const tickSize = 6 * (textSize / 11);

  // X axis units and ticks
  const xDirection = invertX ? -1 : 1;
  for (let i = 0; i <= maxUnitsX; i++) {
    const unitValue = leftEdgeUnit + i;
    if (unitValue === 0) continue; // Skip zero (drawn separately)

    const xPos = centerX + unitValue * unitSize * xDirection;
    if (xPos >= 0 && xPos <= width) {
      if (showTicks) {
        // Draw tick mark
        graphics.line(xPos, centerY - tickSize, xPos, centerY + tickSize);
      }

      // Draw number
      graphics.text(unitValue.toString(), xPos, centerY + tickSize * 3);
    }
  }

  // Y axis units and ticks
  const yDirection = invertY ? 1 : -1;
  for (let i = 0; i <= maxUnitsY; i++) {
    const unitValue = topEdgeUnit + i * (invertY ? -1 : 1);
    if (unitValue === 0) continue; // Skip zero (drawn separately)

    const yPos = centerY + unitValue * unitSize * yDirection;
    if (yPos >= 0 && yPos <= height) {
      if (showTicks) {
        graphics.line(centerX - tickSize, yPos, centerX + tickSize, yPos);
      }

      // Draw number
      graphics.text(unitValue.toString(), centerX + tickSize * 3, yPos);
    }
  }

  // Draw 0 at origin
  graphics.text("0", centerX + tickSize * 3, centerY + tickSize * 3);

  // Restore main line style
  graphics.strokeWeight(mainWidth);
  graphics.stroke(color[0], color[1], color[2], color[3]);
};

/**
 * Renders a coordinate grid as a p5.Image
 * @param options - Grid rendering options
 * @returns p5.Image containing the rendered grid
 */
export const renderGrid = (options: GridOptions): p5.Image => {
  // Destructure options with defaults
  const {
    p,
    center,
    scale = DEFAULT_VALUES.SCALE,
    showSecondary = true,
    showMain = true,
    mainColor = DEFAULT_VALUES.MAIN_COLOR,
    secondaryColor = DEFAULT_VALUES.SECONDARY_COLOR,
    mainOpacity = DEFAULT_VALUES.MAIN_OPACITY,
    secondaryOpacity = DEFAULT_VALUES.SECONDARY_OPACITY,
    showUnits = false,
    showTicks = false,
    invertY = false,
    invertX = false,
    mainWidth = DEFAULT_VALUES.MAIN_WIDTH,
    secondaryWidth = DEFAULT_VALUES.SECONDARY_WIDTH,
    textSize = DEFAULT_VALUES.TEXT_SIZE,
    subgrid = 0,
    subgridColor = DEFAULT_VALUES.SUBGRID_COLOR,
    subgridOpacity = DEFAULT_VALUES.SUBGRID_OPACITY,
    subgridWidth = DEFAULT_VALUES.SUBGRID_WIDTH,
    animated = false,
    animationFramesLength = DEFAULT_VALUES.ANIMATION_FRAMES,
    currentGlobalFrame = 0,
    stagger = DEFAULT_VALUES.STAGGER,
    delay = DEFAULT_VALUES.DELAY,
  } = options;

  // Calculate center if not provided
  const centerX = center?.x !== undefined ? center.x : p.width / 2;
  const centerY = center?.y !== undefined ? center.y : p.height / 2;

  // Create graphics buffer to draw the grid
  const gridGraphics = p.createGraphics(p.width, p.height);

  // Set background to transparent
  gridGraphics.clear();

  // Calculate grid spacing based on scale
  const unitSize = p.width / (2 * scale);

  // Calculate number of grid lines needed
  const numLinesX = Math.ceil(p.width / unitSize) + 1;
  const numLinesY = Math.ceil(p.height / unitSize) + 1;

  // Calculate offsets to position grid lines
  const offsetX = centerX % unitSize;
  const offsetY = centerY % unitSize;

  // Parse colors using colord
  const mainColorRGBA = parseColorToRGBA(mainColor, Math.floor(mainOpacity * 255));
  const secondaryColorRGBA = parseColorToRGBA(secondaryColor, Math.floor(secondaryOpacity * 255));
  const subgridColorRGBA = parseColorToRGBA(subgridColor, Math.floor(subgridOpacity * 255));

  // Draw subgrid if enabled
  if (subgrid > 0) {
    drawGridLines(
      gridGraphics,
      false, // vertical lines
      numLinesX,
      unitSize,
      offsetX,
      centerX,
      centerY,
      p.width,
      p.height,
      subgridWidth,
      subgridColorRGBA,
      false,
      animated,
      currentGlobalFrame,
      delay,
      stagger,
      animationFramesLength,
      subgrid,
      true // skip main grid lines
    );

    drawGridLines(
      gridGraphics,
      true, // horizontal lines
      numLinesY,
      unitSize,
      offsetY,
      centerX,
      centerY,
      p.width,
      p.height,
      subgridWidth,
      subgridColorRGBA,
      false,
      animated,
      currentGlobalFrame,
      delay,
      stagger,
      animationFramesLength,
      subgrid,
      true // skip main grid lines
    );
  }

  // Draw secondary grid lines
  if (showSecondary) {
    drawGridLines(
      gridGraphics,
      false, // vertical lines
      numLinesX,
      unitSize,
      offsetX,
      centerX,
      centerY,
      p.width,
      p.height,
      secondaryWidth,
      secondaryColorRGBA,
      true, // skip center line
      animated,
      currentGlobalFrame,
      delay,
      stagger,
      animationFramesLength
    );

    drawGridLines(
      gridGraphics,
      true, // horizontal lines
      numLinesY,
      unitSize,
      offsetY,
      centerX,
      centerY,
      p.width,
      p.height,
      secondaryWidth,
      secondaryColorRGBA,
      true, // skip center line
      animated,
      currentGlobalFrame,
      delay,
      stagger,
      animationFramesLength
    );
  }

  // Draw main axes
  if (showMain) {
    // Draw X axis
    if (shouldDrawLine(0, currentGlobalFrame, delay, stagger, animated)) {
      const progress = getLineProgress(
        0,
        currentGlobalFrame,
        delay,
        stagger,
        animationFramesLength,
        animated
      );
      if (progress > 0) {
        gridGraphics.strokeWeight(mainWidth);
        gridGraphics.stroke(
          mainColorRGBA[0],
          mainColorRGBA[1],
          mainColorRGBA[2],
          mainColorRGBA[3]
        );
        gridGraphics.line(0, centerY, p.width * progress, centerY);
      }
    }

    // Draw Y axis
    if (shouldDrawLine(0, currentGlobalFrame, delay, stagger, animated)) {
      const progress = getLineProgress(
        0,
        currentGlobalFrame,
        delay,
        stagger,
        animationFramesLength,
        animated
      );
      if (progress > 0) {
        gridGraphics.strokeWeight(mainWidth);
        gridGraphics.stroke(
          mainColorRGBA[0],
          mainColorRGBA[1],
          mainColorRGBA[2],
          mainColorRGBA[3]
        );
        gridGraphics.line(centerX, 0, centerX, p.height * progress);
      }
    }

    // Draw units on axes if needed
    if (showUnits) {
      // Get text alpha for this frame
      const textAlpha = getTextAlpha(
        animated,
        currentGlobalFrame,
        delay,
        animationFramesLength
      );

      // Only render text if there's at least some opacity
      if (textAlpha > 0) {
        drawUnitLabels(
          gridGraphics,
          centerX,
          centerY,
          unitSize,
          p.width,
          p.height,
          textSize,
          showTicks,
          invertX,
          invertY,
          mainColorRGBA,
          mainWidth,
          textAlpha
        );
      }
    }
  }

  // Get the image from the graphics buffer
  const gridImage = gridGraphics.get();

  // Clean up the graphics buffer
  gridGraphics.remove();

  return gridImage;
};
