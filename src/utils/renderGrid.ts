import p5 from "p5";

interface GridOptions {
  p: p5;
  center?: { x: number; y: number };
  scale?: number;
  showSecondary?: boolean;
  showMain?: boolean;
  mainColor?: string;
  secondaryColor?: string;
  mainOpacity?: number;
  secondaryOpacity?: number;
  showUnits?: boolean;
  invertY?: boolean;
  invertX?: boolean;
  mainWidth?: number;
  secondaryWidth?: number;
  textSize?: number;
  subgrid?: number;
  subgridColor?: string;
  subgridOpacity?: number;
  subgridWidth?: number;
  animated?: boolean;
  animationFramesLength?: number;
  currentGlobalFrame?: number;
  stagger?: number;
  delay?: number;
}

/**
 * Renders a coordinate grid as a p5.Image
 * @param options Grid rendering options
 * @returns p5.Image containing the rendered grid
 */
export const renderGrid = (options: GridOptions): p5.Image => {
  const {
    p,
    center,
    scale = 4,
    showSecondary = true,
    showMain = true,
    mainColor = "#ffffff",
    secondaryColor = "#ffffff",
    mainOpacity = 1,
    secondaryOpacity = 0.25,
    showUnits = false,
    invertY = false,
    invertX = false,
    mainWidth = 1,
    secondaryWidth = 1,
    textSize = 11,
    subgrid = 0,
    subgridColor = "#ffffff",
    subgridOpacity = 0.1,
    subgridWidth = 0.5,
    animated = false,
    animationFramesLength = 60,
    currentGlobalFrame = 0,
    stagger = 5,
    delay = 20,
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

  // Animation helper functions
  const isAnimating =
    animated && currentGlobalFrame < delay + animationFramesLength;

  // Ease-out-quart function for smooth animation with stronger deceleration
  const easeOutQuart = (t: number): number => {
    return 1 - Math.pow(1 - t, 4);
  };

  const shouldDrawLine = (index: number, isVertical: boolean) => {
    if (!animated) return true;
    if (currentGlobalFrame < delay) return false;

    const animFrame = currentGlobalFrame - delay;
    const lineDelay = index * stagger;

    return animFrame >= lineDelay;
  };

  const getLineProgress = (index: number, isVertical: boolean) => {
    if (!animated) return 1;
    if (currentGlobalFrame < delay) return 0;

    const animFrame = currentGlobalFrame - delay;
    const lineDelay = index * stagger;

    if (animFrame < lineDelay) return 0;

    const linearProgress =
      (animFrame - lineDelay) / (animationFramesLength - lineDelay);
    // Apply easeOutQuart to make the animation smoother with stronger deceleration
    return Math.min(1, easeOutQuart(Math.min(1, linearProgress)));
  };

  // Calculate text opacity based on animation progress
  const getTextOpacity = () => {
    if (!animated) return 1;
    if (currentGlobalFrame < delay + animationFramesLength / 2) return 0;

    // Start fading in at the middle of the animation
    const fadeStart = delay + animationFramesLength / 2;
    const fadeProgress =
      (currentGlobalFrame - fadeStart) / (animationFramesLength / 2);

    // Apply easeOutQuart for the fade
    return Math.min(1, easeOutQuart(Math.min(1, fadeProgress)));
  };

  // Draw subgrid if enabled
  if (subgrid > 0) {
    // Set subgrid line style
    gridGraphics.strokeWeight(subgridWidth);
    const subgridAlpha = Math.floor(subgridOpacity * 255);
    gridGraphics.stroke(
      parseInt(subgridColor.slice(1, 3), 16),
      parseInt(subgridColor.slice(3, 5), 16),
      parseInt(subgridColor.slice(5, 7), 16),
      subgridAlpha
    );

    // Calculate subgrid cell size
    const subUnitSize = unitSize / subgrid;

    // Draw vertical subgrid lines
    for (let i = 0; i < numLinesX * subgrid; i++) {
      const x = i * subUnitSize + offsetX;
      // Skip lines that coincide with main or secondary grid
      if (i % subgrid !== 0) {
        if (shouldDrawLine(i, true)) {
          const progress = getLineProgress(i, true);
          if (progress > 0) {
            const startY = 0;
            const endY = p.height * progress;
            gridGraphics.line(x, startY, x, endY);
          }
        }
      }
    }

    // Draw horizontal subgrid lines
    for (let i = 0; i < numLinesY * subgrid; i++) {
      const y = i * subUnitSize + offsetY;
      // Skip lines that coincide with main or secondary grid
      if (i % subgrid !== 0) {
        if (shouldDrawLine(i, false)) {
          const progress = getLineProgress(i, false);
          if (progress > 0) {
            const startX = 0;
            const endX = p.width * progress;
            gridGraphics.line(startX, y, endX, y);
          }
        }
      }
    }
  }

  // Draw secondary grid lines
  if (showSecondary) {
    // Set secondary grid line style
    gridGraphics.stroke(secondaryColor);
    gridGraphics.strokeWeight(secondaryWidth);
    const secondaryAlpha = Math.floor(secondaryOpacity * 255);
    gridGraphics.stroke(
      parseInt(secondaryColor.slice(1, 3), 16),
      parseInt(secondaryColor.slice(3, 5), 16),
      parseInt(secondaryColor.slice(5, 7), 16),
      secondaryAlpha
    );

    // Draw vertical secondary lines
    for (let i = 0; i < numLinesX; i++) {
      const x = i * unitSize + offsetX;
      if (x !== centerX) {
        // Skip the center line (will be drawn as main)
        if (shouldDrawLine(i, true)) {
          const progress = getLineProgress(i, true);
          if (progress > 0) {
            const startY = 0;
            const endY = p.height * progress;
            gridGraphics.line(x, startY, x, endY);
          }
        }
      }
    }

    // Draw horizontal secondary lines
    for (let i = 0; i < numLinesY; i++) {
      const y = i * unitSize + offsetY;
      if (y !== centerY) {
        // Skip the center line (will be drawn as main)
        if (shouldDrawLine(i, false)) {
          const progress = getLineProgress(i, false);
          if (progress > 0) {
            const startX = 0;
            const endX = p.width * progress;
            gridGraphics.line(startX, y, endX, y);
          }
        }
      }
    }
  }

  // Draw main axes
  if (showMain) {
    // Set main grid line style
    gridGraphics.stroke(mainColor);
    gridGraphics.strokeWeight(mainWidth);
    const mainAlpha = Math.floor(mainOpacity * 255);
    gridGraphics.stroke(
      parseInt(mainColor.slice(1, 3), 16),
      parseInt(mainColor.slice(3, 5), 16),
      parseInt(mainColor.slice(5, 7), 16),
      mainAlpha
    );

    // Draw X axis with animation if enabled
    if (shouldDrawLine(0, false)) {
      const progress = getLineProgress(0, false);
      if (progress > 0) {
        const startX = 0;
        const endX = p.width * progress;
        gridGraphics.line(startX, centerY, endX, centerY);
      }
    }

    // Draw Y axis with animation if enabled
    if (shouldDrawLine(0, true)) {
      const progress = getLineProgress(0, true);
      if (progress > 0) {
        const startY = 0;
        const endY = p.height * progress;
        gridGraphics.line(centerX, startY, centerX, endY);
      }
    }

    // Draw units on axes if needed (only when animation started fade-in or is complete or disabled)
    if (
      showUnits &&
      (!animated || currentGlobalFrame >= delay + animationFramesLength / 2)
    ) {
      // Calculate text opacity for fade-in
      const textOpacityMultiplier = getTextOpacity();

      // Use a lighter opacity for text (50% of the main opacity * current fade progress)
      const textAlpha = Math.floor(
        mainOpacity * 0.5 * 255 * textOpacityMultiplier
      );

      gridGraphics.fill(
        parseInt(mainColor.slice(1, 3), 16),
        parseInt(mainColor.slice(3, 5), 16),
        parseInt(mainColor.slice(5, 7), 16),
        textAlpha
      );

      gridGraphics.textAlign(gridGraphics.CENTER, gridGraphics.CENTER);
      gridGraphics.textSize(textSize);
      // Set monospaced font with lighter weight
      gridGraphics.textFont("Courier New");
      gridGraphics.textStyle(gridGraphics.NORMAL);

      // Calculate how many units fit in the canvas
      const maxUnitsX = Math.ceil(p.width / unitSize) + 1;
      const maxUnitsY = Math.ceil(p.height / unitSize) + 1;

      // Calculate the unit value at the left edge of the canvas
      const leftEdgeUnit = -Math.ceil(centerX / unitSize);
      // Calculate the unit value at the top edge of the canvas
      const topEdgeUnit = invertY
        ? Math.ceil(centerY / unitSize)
        : -Math.ceil(centerY / unitSize);

      // Define tick size
      const tickSize = 6 * (textSize / 11); // Scale tick size proportionally to text size

      // X axis units and ticks
      const xDirection = invertX ? -1 : 1;
      for (let i = 0; i <= maxUnitsX; i++) {
        const unitValue = leftEdgeUnit + i;
        if (unitValue === 0) continue; // Skip zero (drawn separately)

        const xPos = centerX + unitValue * unitSize * xDirection;
        // Only draw if within canvas bounds
        if (xPos >= 0 && xPos <= p.width) {
          // Draw tick mark
          gridGraphics.strokeWeight(1);
          gridGraphics.line(xPos, centerY - tickSize, xPos, centerY + tickSize);

          // Draw label
          gridGraphics.text(unitValue.toString(), xPos, centerY + tickSize * 3);
        }
      }

      // Y axis units and ticks
      const yDirection = invertY ? 1 : -1;
      for (let i = 0; i <= maxUnitsY; i++) {
        const unitValue = topEdgeUnit + i * (invertY ? -1 : 1);
        if (unitValue === 0) continue; // Skip zero (drawn separately)

        const yPos = centerY + unitValue * unitSize * yDirection;
        // Only draw if within canvas bounds
        if (yPos >= 0 && yPos <= p.height) {
          // Draw tick mark
          gridGraphics.strokeWeight(1);
          gridGraphics.line(centerX - tickSize, yPos, centerX + tickSize, yPos);

          // Draw label
          gridGraphics.text(unitValue.toString(), centerX + tickSize * 3, yPos);
        }
      }

      // Draw 0 at origin
      gridGraphics.text("0", centerX + tickSize * 3, centerY + tickSize * 3);
    }
  }

  // Get the image from the graphics buffer
  const gridImage = gridGraphics.get();

  // Clean up the graphics buffer
  gridGraphics.remove();

  return gridImage;
};
