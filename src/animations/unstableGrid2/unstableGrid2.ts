import p5 from "p5";
import { AnimationSettings, AnimationFunction } from "@/types/animations";
import { createNoise2D } from "simplex-noise";
import {
  Rectangle,
  Line,
  Point,
  Color,
  defaultRectangleRenderer,
  RectangleRenderFunction,
  RectangleMetadata,
} from "./Rectangle";
import { generateAlphabetTextures } from "../../utils/textureUtils";
import {
  config,
  getActiveColorScheme,
  ColorSchemeName,
  EasingFunctionName,
} from "./config";
import { easings } from "../../utils/easing";

// --- Font Loading ---
// Remove preload logic - rely on CSS loading via index.html
// let cascadiaFont: p5.Font;
// const CASCADIA_CODE_URL = '...';
// function preloadAnimation(p: p5) { ... }

// --- Color Definitions ---
// const DARK_PURPLE = "#6A0DAD";
// const LIME_GREEN = "#32CD32";
// const COLOR_PALETTE: string[] = [DARK_PURPLE, LIME_GREEN];

// Global variable to hold the generated textures
// let alphabetTextures: Record<string, p5.Graphics> = {};
// const CHARS_FOR_TEXTURES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Same chars as in generator

// --- Removed Constants (defined in config) ---
// const FPS = 60;
// const WIDTH = 1080;
// const HEIGHT = 1920;
// const DURATION = 30;
// export const columnsCount = 8;
// export const cellsCount = 8;
// const cellAmplitude = HEIGHT / cellsCount * 1; // Recalculate base amplitude inside setup
// const columnNoiseOffset = -20;
// const columnNoiseFrequency = 1.5;
// const columnNoiseSpeed = 25;
// const columnDisplacementFactor = 0.8;
// const gridInsetColumns = 0;
// const gridInsetRows = 0;
// const includeOuterEdges = true;
// const outerEdgePadding = 150;

// --- Use config values directly or recalculate based on config ---
const DURATION = config.durationInSeconds;
const FPS = config.fps;
let cellAmplitude: number; // This is also likely unused now

// --- State Variables for Point Grid ---
let noise2D: ReturnType<typeof createNoise2D>;
let originalPoints: Point[][] = [];
let previousPoints: Point[][] = [];
let targetPoints: Point[][] = [];
let currentPoints: Point[][] = []; // Holds the interpolated points
let rectangles: Rectangle[] = [];
let alphabetTextures: Record<string, p5.Graphics> = {};

// --- Глобальная переменная для активной схемы ---
let activeColorScheme = getActiveColorScheme(config.colorSchemeName);

// --- Easing Functions ---
// REMOVED inline definitions
/*
const easingFunctions: Record<EasingFunctionName, (t: number) => number> = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
};
*/

// Helper to get the active function from the imported object
function getActiveEasingFunction(): (t: number) => number {
  const functionName = config.easingFunctionName;
  // Check if the functionName is a valid key in the imported easings object
  if (Object.prototype.hasOwnProperty.call(easings, functionName)) {
    return easings[functionName as keyof typeof easings];
  }
  // If not found, log a warning and fallback to linear
  console.warn(
    `Easing function "${functionName}" not found in easings object. Falling back to linear.`
  );
  // Assume 'linear' function exists in the easings object for fallback
  // If 'linear' might be missing, add another check here.
  return easings["linear" as keyof typeof easings] || ((t: number) => t); // Fallback to identity if even linear is missing
}

// --- lerpPoint Helper ---
function lerpPoint(p: p5, p1: Point, p2: Point, t: number): Point {
  return {
    x: p.lerp(p1.x, p2.x, t),
    y: p.lerp(p1.y, p2.y, t),
  };
}

// --- Textured Rectangle Renderer (No changes needed, uses vertices) ---
const renderTexturedRectangle: RectangleRenderFunction = (
  p: p5,
  _normalizedTime: number,
  _lines: Line[],
  _intersection: Point | null,
  vertices: Point[],
  _color: Color,
  metadata: RectangleMetadata | null
): void => {
  // Extract cell coordinates and index
  const col = metadata?.colTopLeft;
  const row = metadata?.rowTopLeft;
  const rectIndex = metadata?.rectIndex;

  if (
    col === undefined ||
    row === undefined ||
    vertices.length !== 4 ||
    rectIndex === undefined
  )
    return;

  let letter: string | null = null;
  let assignedColorHex: string | null = null;
  let isTextCell = false;

  // Check if this cell corresponds to a character in the textLines
  if (row >= 0 && row < config.textLines.length) {
    const currentLine = config.textLines[row];
    if (currentLine !== "" && col >= 0 && col < currentLine.length) {
      letter = currentLine[col];
      assignedColorHex =
        col % 2 === 0
          ? activeColorScheme.primary
          : activeColorScheme.primary_darker;
      isTextCell = true;
    }
  }

  // If it's not a text cell, treat it as a border/filler cell
  if (!isTextCell) {
    const charIndex = (rectIndex + col + row) % config.charsForTexture.length;
    letter = config.charsForTexture[charIndex];
    assignedColorHex = activeColorScheme.secondary; // Use secondary color for filler
  }

  // --- Rendering (Single Quad) ---
  if (letter) {
    const texture = alphabetTextures[letter];
    if (texture) {
      p.push();
      if (assignedColorHex) {
        p.tint(assignedColorHex);
      } else {
        p.tint(255);
      }
      p.textureMode(p.NORMAL);
      p.textureWrap(p.CLAMP);
      p.texture(texture);
      p.noStroke();

      // Define UV coordinates for the 4 corners
      const UV_EPSILON = config.textureUvEpsilon;
      const uv00 = { u: UV_EPSILON, v: UV_EPSILON }; // Top Left
      const uv10 = { u: 1 - UV_EPSILON, v: UV_EPSILON }; // Top Right
      const uv11 = { u: 1 - UV_EPSILON, v: 1 - UV_EPSILON }; // Bottom Right
      const uv01 = { u: UV_EPSILON, v: 1 - UV_EPSILON }; // Bottom Left

      // Draw the original single quad (2 triangles implicitly)
      p.beginShape();
      p.vertex(vertices[0].x, vertices[0].y, uv00.u, uv00.v); // Top Left
      p.vertex(vertices[1].x, vertices[1].y, uv10.u, uv10.v); // Top Right
      p.vertex(vertices[2].x, vertices[2].y, uv11.u, uv11.v); // Bottom Right
      p.vertex(vertices[3].x, vertices[3].y, uv01.u, uv01.v); // Bottom Left
      p.endShape(p.CLOSE);

      p.noTint();
      p.pop();
    } else {
      console.warn(`Texture not found for letter: ${letter}`);
    }
  }
};

const renderRectangle: RectangleRenderFunction = renderTexturedRectangle;

// Easing function (easeInOut Quadratic)
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
function easeInOutPower(t: number, power: number): number {
  t = Math.max(0, Math.min(1, t)); // Clamp t to [0, 1]
  if (t < 0.5) {
    return Math.pow(2, power - 1) * Math.pow(t, power);
  } else {
    return 1 - Math.pow(-2 * t + 2, power) / 2;
  }
}

// --- Setup Grid Points ---
function setupGridPoints(p: p5) {
  originalPoints = [];
  previousPoints = [];
  targetPoints = [];
  currentPoints = [];

  const gridW = config.width;
  const gridH = config.height;
  const cols = config.gridColumns;
  const rows = config.gridRows;
  const cellWidth = gridW / cols;
  const cellHeight = gridH / rows;

  for (let j = 0; j <= rows; j++) {
    // Iterate rows (Y)
    originalPoints[j] = [];
    previousPoints[j] = [];
    targetPoints[j] = [];
    currentPoints[j] = [];
    for (let i = 0; i <= cols; i++) {
      // Iterate columns (X)
      const x = i * cellWidth;
      const y = j * cellHeight;
      const point = { x, y };
      originalPoints[j][i] = { ...point };
      previousPoints[j][i] = { ...point };
      targetPoints[j][i] = { ...point }; // Initial target is original
      currentPoints[j][i] = { ...point };
    }
  }
  setupRectangles(); // Setup rectangles based on initial points
}

// --- Setup Rectangles (using Point Grid) ---
function setupRectangles() {
  rectangles = [];
  const cols = config.gridColumns;
  const rows = config.gridRows;

  // Add padding calculation if needed (maybe not if includeOuterEdges is false)
  const minX = config.includeOuterEdges ? -config.outerEdgePadding : 0;
  const maxX = config.includeOuterEdges
    ? config.width + config.outerEdgePadding
    : config.width;
  const minY = config.includeOuterEdges ? -config.outerEdgePadding : 0;
  const maxY = config.includeOuterEdges
    ? config.height + config.outerEdgePadding
    : config.height;

  // Iterate through the cells (not points) to create rectangles
  for (let j = 0; j < rows; j++) {
    // Cell rows
    for (let i = 0; i < cols; i++) {
      // Cell columns
      // Get the 4 corner points for this cell
      const topLeft = currentPoints[j][i];
      const topRight = currentPoints[j][i + 1];
      const bottomRight = currentPoints[j + 1][i + 1];
      const bottomLeft = currentPoints[j + 1][i];

      const rect = new Rectangle(topLeft, topRight, bottomRight, bottomLeft);
      rect.setMetadata({
        colTopLeft: i, // Grid cell column index
        rowTopLeft: j, // Grid cell row index
        colBottomRight: i + 1,
        rowBottomRight: j + 1,
      });
      rectangles.push(rect);

      // TODO: Add handling for outer edge rectangles if includeOuterEdges is true?
      // This might involve creating rectangles using points outside the main grid.
      // For now, focusing on the internal grid.
    }
  }
}

// --- Update Rectangles (using Point Grid) ---
function updateRectangles() {
  let rectIndex = 0;
  const cols = config.gridColumns;
  const rows = config.gridRows;

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      if (rectIndex < rectangles.length) {
        const rect = rectangles[rectIndex];
        // Get updated points from currentPoints
        const topLeft = currentPoints[j][i];
        const topRight = currentPoints[j][i + 1];
        const bottomRight = currentPoints[j + 1][i + 1];
        const bottomLeft = currentPoints[j + 1][i];
        rect.setVertices(topLeft, topRight, bottomRight, bottomLeft);
      }
      rectIndex++;
    }
  }
  // TODO: Update outer edge rectangles if implemented
}

// --- Calculate New Target Points ---
function calculateNewTargetPoints(p: p5) {
  const cols = config.gridColumns;
  const rows = config.gridRows;
  const cellWidth = config.width / cols;
  const cellHeight = config.height / rows;
  const maxDispX = cellWidth * config.pointDisplacementXFactor;
  const maxDispY = cellHeight * config.pointDisplacementYFactor;

  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      // Keep boundary points fixed (or allow limited movement later)
      if (i === 0 || i === cols || j === 0 || j === rows) {
        targetPoints[j][i] = { ...originalPoints[j][i] };
        continue; // Skip inner logic for boundary points
      }

      // Calculate random displacement for interior points
      const randomX = p.random(-1, 1);
      const randomY = p.random(-1, 1);

      const displacementX = randomX * maxDispX;
      const displacementY = randomY * maxDispY;

      // TODO: Add collision avoidance or stricter limits?
      // For now, just apply displacement to original position.
      // Could limit displacement based on distance to original neighbors.

      targetPoints[j][i] = {
        x: originalPoints[j][i].x + displacementX,
        y: originalPoints[j][i].y + displacementY,
      };
    }
  }
}

// --- Animation Loop ---
const animation: AnimationFunction = (
  p: p5,
  normalizedTime: number,
  currentFrameNum: number
): void => {
  p.background(activeColorScheme.background);
  p.translate(-config.width / 2, -config.height / 2);

  const updateInterval = config.updateIntervalFrames;
  const isUpdateFrame = currentFrameNum % updateInterval === 0;

  // --- Update Targets ---
  if (isUpdateFrame || currentFrameNum === 0) {
    // Store current points as previous
    previousPoints = currentPoints.map((row) => row.map((pt) => ({ ...pt })));
    calculateNewTargetPoints(p); // Calculate new targets for all points
  }

  // --- Interpolate Points ---
  const progressInInterval =
    (currentFrameNum % updateInterval) / updateInterval;
  const activeEase = getActiveEasingFunction();
  const lerpFactor = activeEase(progressInInterval);

  for (let j = 0; j < currentPoints.length; j++) {
    for (let i = 0; i < currentPoints[j].length; i++) {
      currentPoints[j][i] = lerpPoint(
        p,
        previousPoints[j][i],
        targetPoints[j][i],
        lerpFactor
      );
    }
  }

  // --- Update Geometry & Render ---
  updateRectangles(); // Update rectangle vertices based on interpolated points

  rectangles.forEach((rect, index) => {
    const metadata = rect.getMetadata();
    if (metadata) {
      metadata.rectIndex = index; // Assign index needed by renderer
      renderRectangle(
        p,
        normalizedTime,
        rect.getLines(),
        rect.getDiagonalIntersection(),
        rect.getVertices(),
        rect.getColor(),
        metadata
      );
    }
  });
};

// --- Setup Function ---
const setupAnimation: AnimationFunction = (p: p5): void => {
  activeColorScheme = getActiveColorScheme(config.colorSchemeName);
  console.log(`Using color scheme: ${config.colorSchemeName}`);
  p.background(activeColorScheme.background);
  p.frameRate(config.fps);
  noise2D = createNoise2D();

  const selectedTextureSize = config.useHighResTextures
    ? config.textureSizeRender
    : config.textureSizePreview;
  console.log(
    `Using texture size: ${selectedTextureSize}x${selectedTextureSize}`
  );
  alphabetTextures = generateAlphabetTextures(
    p,
    selectedTextureSize,
    config.fontFamily,
    config.charsForTexture
  );

  setupGridPoints(p); // Initialize the point grid

  console.log(
    "Setup complete using config (Point Grid). Textures generated:",
    Object.keys(alphabetTextures).length
  );
  console.log("Rectangles created:", rectangles.length);
};

// Now declare the settings after animation is defined
export const settings: AnimationSettings = {
  id: "unstableGrid2",
  name: "unstableGrid2",

  fps: config.fps,
  width: config.width,
  height: config.height,
  totalFrames: config.durationInSeconds * config.fps,

  function: animation,
  onSetup: setupAnimation,
};
