import p5 from "p5";
import { AnimationSettings, AnimationFunction } from "@/types/animations";
import { Column } from "./Columns";
import { createNoise2D } from "simplex-noise";

const FPS = 60;
const WIDTH = 1080;
const HEIGHT = 1920;
const DURATION = 60;

const columnsCount = 6;
// Number of cells in each column
const cellsCount = 8;
// Amplitude of cell y-movement
const cellAmplitude = WIDTH / columnsCount;
// Noise offset between columns (0 = synchronized, higher = more different)
const columnNoiseOffset = 0.7;
// Text size for cell labels
const cellTextSize = 14;

// Noise control parameters
// Frequency for column positioning (lower = smoother transitions)
const columnNoiseFrequency = 0.3;
// Speed of column movement (lower = slower changes)
const columnNoiseSpeed = 10;
// Maximum displacement as a fraction of column width
const columnDisplacementFactor = 0.2;

// Create a single noise generator for consistent values
const noise2D = createNoise2D();

// Store line positions
const linePositions: number[] = [];
const originalPositions: number[] = [];

// Store columns
const columns: Column[] = [];

function setupLines() {
  // Clear any existing data
  linePositions.length = 0;
  originalPositions.length = 0;
  columns.length = 0;

  // Set up evenly spaced lines
  const spacing = WIDTH / columnsCount;

  // Create positions for all division lines (including left and right edge)
  for (let i = 0; i <= columnsCount; i++) {
    const xPos = i * spacing;
    linePositions.push(xPos);
    originalPositions.push(xPos); // Store original positions for reference
  }

  // Create columns between the lines
  for (let i = 0; i < columnsCount; i++) {
    const leftX = linePositions[i];
    const rightX = linePositions[i + 1];
    const column = new Column(leftX, rightX, cellsCount, i, 0);

    // Set amplitude and noise offset for cells
    column.setCellAmplitude(cellAmplitude);
    column.setNoiseOffset(columnNoiseOffset);

    // You can set additional cell noise parameters here
    column.setCellNoiseFrequency(0.3);
    column.setCellNoiseSpeed(10);

    columns.push(column);
  }
}

const animation: AnimationFunction = (p: p5, normalizedTime: number): void => {
  p.background(0);

  // Reduce delay to start animation almost immediately
  const isActive = normalizedTime > 0.001;

  // Update line positions based on noise
  // Keep first and last positions fixed (edges of screen)
  for (let i = 1; i < linePositions.length - 1; i++) {
    if (isActive) {
      // Use noise to get a value between -1 and 1
      const noiseValue =
        noise2D(i * columnNoiseFrequency, normalizedTime * columnNoiseSpeed) *
          2 -
        1;

      // Maximum displacement amount (% of the original spacing)
      const maxDisplacement = (WIDTH / columnsCount) * columnDisplacementFactor;

      // Calculate new position with displacement
      let newPosition = originalPositions[i] + noiseValue * maxDisplacement;

      // Ensure minimum column width (16px)
      const minLeftX = linePositions[i - 1] + 96; // minimum 96px from previous line
      const maxRightX =
        i < linePositions.length - 1
          ? linePositions[i + 1] - 96 // minimum 96px from next line
          : WIDTH; // or right edge

      // Clamp the new position to maintain minimum width
      newPosition = Math.max(minLeftX, Math.min(maxRightX, newPosition));

      linePositions[i] = newPosition;
    } else {
      // Reset to original position for start of animation
      linePositions[i] = originalPositions[i];
    }
  }

  // Update columns based on line positions
  for (let i = 0; i < columns.length; i++) {
    const leftX = linePositions[i];
    const rightX = linePositions[i + 1];

    columns[i].setBounds(leftX, rightX);
    columns[i].setGlobalProgress(normalizedTime);
    columns[i].update();
  }

  // Draw grid and cells
  p.stroke(255);
  p.strokeWeight(2);

  // Draw horizontal cell dividers
  for (let i = 0; i < columns.length; i++) {
    const column = columns[i];

    // Draw vertical column boundaries (skip leftmost and rightmost)
    if (i > 0 && i < columns.length) {
      p.line(linePositions[i], 0, linePositions[i], HEIGHT);
    }

    // Draw horizontal cell boundaries
    for (let j = 0; j < cellsCount; j++) {
      if (column.cells && column.cells[j]) {
        const cell = column.cells[j];
        // Draw bottom boundary of each cell (except the first and last ones)
        if (j > 0 && j < cellsCount - 1) {
          p.line(cell.leftX, cell.bottomY, cell.rightX, cell.bottomY);
        }

        // Draw cell dimensions
        p.fill(255);
        p.noStroke();
        p.textSize(cellTextSize);
        p.textAlign(p.CENTER, p.CENTER);

        // Calculate cell dimensions for display
        const cellWidth = Math.round(cell.width);
        const cellHeight = Math.round(cell.height);

        // Draw width on top line
        p.text(`W: ${cellWidth}`, cell.centerX, cell.centerY - cellTextSize);

        // Draw height on bottom line
        p.text(`H: ${cellHeight}`, cell.centerX, cell.centerY + cellTextSize);
      }
    }
  }
};

const setupAnimation: AnimationFunction = (p: p5): void => {
  p.background(0);
  p.frameRate(FPS);

  setupLines();
};

// Now declare the settings after animation is defined
export const settings: AnimationSettings = {
  id: "unstableGrid",
  name: "unstableGrid",

  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  totalFrames: DURATION * FPS,

  function: animation,
  onSetup: setupAnimation,
};
