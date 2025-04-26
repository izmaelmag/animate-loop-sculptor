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
const cellsCount = 12;
// Amplitude of cell y-movement
const cellAmplitude = 40;
// Noise offset between columns (0 = synchronized, higher = more different)
const columnNoiseOffset = 0.7;

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
      const noiseValue = noise2D(i * 0.5, normalizedTime * 20) * 2 - 1;

      // Maximum displacement amount (% of the original spacing)
      const maxDisplacement = (WIDTH / columnsCount) * 0.4;

      // Calculate new position with displacement
      linePositions[i] = originalPositions[i] + noiseValue * maxDisplacement;
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

    // Draw vertical column boundaries
    p.line(linePositions[i], 0, linePositions[i], HEIGHT);

    // Draw horizontal cell boundaries
    for (let j = 0; j < cellsCount; j++) {
      if (column.cells && column.cells[j]) {
        const cell = column.cells[j];
        // Draw bottom boundary of each cell (except the last one which is at the bottom edge)
        if (j < cellsCount - 1) {
          p.line(cell.leftX, cell.bottomY, cell.rightX, cell.bottomY);
        }
      }
    }
  }

  // Draw the last vertical line (rightmost boundary)
  p.line(
    linePositions[linePositions.length - 1],
    0,
    linePositions[linePositions.length - 1],
    HEIGHT
  );
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
