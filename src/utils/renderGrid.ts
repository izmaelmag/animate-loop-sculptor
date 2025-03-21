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

  // Function to get text opacity (0-255) based on animation state
  const getTextAlpha = (): number => {
    if (!animated) return 255; // Half opacity for non-animated
    if (currentGlobalFrame < delay) return 0; // No text before delay

    // Simple linear fade from 0 to 128 (half opacity)
    const fadeProgress =
      ((currentGlobalFrame - delay) * 2) / animationFramesLength;
    return Math.min(1, fadeProgress) * 255;
  };

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
  const easeOutQuart = (x: number): number => {
    return x === 1 ? 1 : 1 - Math.pow(1 - x, 4);
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

    // Draw units on axes if needed
    if (showUnits) {
      // Get text alpha for this frame
      const textAlpha = getTextAlpha();

      // Only render text if there's at least some opacity
      if (textAlpha > 0) {
        // Text color components
        const r = parseInt(mainColor.slice(1, 3), 16);
        const g = parseInt(mainColor.slice(3, 5), 16);
        const b = parseInt(mainColor.slice(5, 7), 16);

        // Configure text appearance
        gridGraphics.textAlign(gridGraphics.CENTER, gridGraphics.CENTER);
        gridGraphics.textSize(textSize);
        gridGraphics.textFont("Courier New");

        // Set text color with calculated alpha
        gridGraphics.fill(r, g, b, textAlpha);

        // Set stroke color for tick marks with same alpha
        gridGraphics.strokeWeight(1);
        gridGraphics.stroke(r, g, b, textAlpha);

        // Calculate grid details
        const maxUnitsX = Math.ceil(p.width / unitSize) + 1;
        const maxUnitsY = Math.ceil(p.height / unitSize) + 1;
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
          if (xPos >= 0 && xPos <= p.width) {
            // Draw tick mark
            gridGraphics.line(
              xPos,
              centerY - tickSize,
              xPos,
              centerY + tickSize
            );

            // Draw number
            gridGraphics.text(
              unitValue.toString(),
              xPos,
              centerY + tickSize * 3
            );
          }
        }

        // Y axis units and ticks
        const yDirection = invertY ? 1 : -1;
        for (let i = 0; i <= maxUnitsY; i++) {
          const unitValue = topEdgeUnit + i * (invertY ? -1 : 1);
          if (unitValue === 0) continue; // Skip zero (drawn separately)

          const yPos = centerY + unitValue * unitSize * yDirection;
          if (yPos >= 0 && yPos <= p.height) {
            // Draw tick mark
            gridGraphics.line(
              centerX - tickSize,
              yPos,
              centerX + tickSize,
              yPos
            );

            // Draw number
            gridGraphics.text(
              unitValue.toString(),
              centerX + tickSize * 3,
              yPos
            );
          }
        }

        // Draw 0 at origin
        gridGraphics.text("0", centerX + tickSize * 3, centerY + tickSize * 3);

        // Restore main line style
        gridGraphics.strokeWeight(mainWidth);
        gridGraphics.stroke(r, g, b, mainAlpha);
      }
    }
  }

  // Get the image from the graphics buffer
  const gridImage = gridGraphics.get();

  // Clean up the graphics buffer
  gridGraphics.remove();

  return gridImage;
};
