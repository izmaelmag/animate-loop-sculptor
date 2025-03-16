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
    mainWidth = 2,
    secondaryWidth = 1,
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
      if (x !== centerX) { // Skip the center line (will be drawn as main)
        gridGraphics.line(x, 0, x, p.height);
      }
    }
    
    // Draw horizontal secondary lines
    for (let i = 0; i < numLinesY; i++) {
      const y = i * unitSize + offsetY;
      if (y !== centerY) { // Skip the center line (will be drawn as main)
        gridGraphics.line(0, y, p.width, y);
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
    
    // Draw X axis
    gridGraphics.line(0, centerY, p.width, centerY);
    
    // Draw Y axis
    gridGraphics.line(centerX, 0, centerX, p.height);
    
    // Draw units on axes if needed
    if (showUnits) {
      gridGraphics.fill(mainColor);
      gridGraphics.textAlign(gridGraphics.CENTER, gridGraphics.CENTER);
      gridGraphics.textSize(12);
      
      // X axis units
      const xDirection = invertX ? -1 : 1;
      for (let i = 1; i <= scale; i++) {
        // Positive X
        const xPos = centerX + i * unitSize * xDirection;
        gridGraphics.text(i.toString(), xPos, centerY + 20);
        
        // Negative X
        const xNeg = centerX - i * unitSize * xDirection;
        gridGraphics.text((-i).toString(), xNeg, centerY + 20);
      }
      
      // Y axis units
      const yDirection = invertY ? 1 : -1;
      for (let i = 1; i <= scale; i++) {
        // Positive Y (up in standard coordinates, down if inverted)
        const yPos = centerY + i * unitSize * yDirection;
        gridGraphics.text(i.toString(), centerX + 20, yPos);
        
        // Negative Y (down in standard coordinates, up if inverted)
        const yNeg = centerY - i * unitSize * yDirection;
        gridGraphics.text((-i).toString(), centerX + 20, yNeg);
      }
      
      // Draw 0 at origin
      gridGraphics.text("0", centerX + 20, centerY + 20);
    }
  }
  
  // Get the image from the graphics buffer
  const gridImage = gridGraphics.get();
  
  // Clean up the graphics buffer
  gridGraphics.remove();
  
  return gridImage;
}; 