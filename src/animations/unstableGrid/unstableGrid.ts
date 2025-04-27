import p5 from "p5";
import { AnimationSettings, AnimationFunction } from "@/types/animations";
import { Column } from "./Columns";
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
import { generateAlphabetTextures } from "../../utils/textureUtils"; // Corrected path
import { config, getActiveColorScheme, ColorSchemeName, EasingFunctionName } from "./config"; // Import config and getActiveColorScheme
import { easings } from "../../utils/easing"; // Импортируем объект easings

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
export const columnsCount = config.columnsCount; // Keep export if needed elsewhere
export const cellsCount = config.cellsCount;     // Keep export if needed elsewhere
let cellAmplitude: number; // Will be calculated in setupAnimation

// --- State Variables ---
let noise2D: ReturnType<typeof createNoise2D>;
let linePositions: number[] = [];
let originalPositions: number[] = [];
let targetLinePositions: number[] = []; // Target positions for lines
let previousLinePositions: number[] = []; // Line positions at the start of the interval
let columns: Column[] = [];
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
    console.warn(`Easing function "${functionName}" not found in easings object. Falling back to linear.`);
    // Assume 'linear' function exists in the easings object for fallback
    // If 'linear' might be missing, add another check here.
    return easings['linear' as keyof typeof easings] || ((t: number) => t); // Fallback to identity if even linear is missing
}

// Helper function for linear interpolation of points
function lerpPoint(p: p5, p1: Point, p2: Point, t: number): Point {
    return {
        x: p.lerp(p1.x, p2.x, t),
        y: p.lerp(p1.y, p2.y, t),
    };
}

// --- Updated Textured Rectangle Renderer with Subdivision ---
const renderTexturedRectangle: RectangleRenderFunction = (
  p: p5,
  _normalizedTime: number,
  _lines: Line[],
  _intersection: Point | null,
  vertices: Point[], // Should be [topLeft, topRight, bottomRight, bottomLeft]
  _color: Color, 
  metadata: RectangleMetadata | null
): void => {
  // Extract cell coordinates and index
  const col = metadata?.colTopLeft; 
  const row = metadata?.rowTopLeft; 
  const rectIndex = metadata?.rectIndex;

  if (col === undefined || row === undefined || vertices.length !== 4 || rectIndex === undefined) return;

  let letter: string | null = null;
  let assignedColorHex: string | null = null;
  let isTextCell = false;

  // Check if this cell corresponds to a character in the textLines
  if (row >= 0 && row < config.textLines.length) {
      const currentLine = config.textLines[row];
      if (col >= 0 && col < currentLine.length) {
          letter = currentLine[col];
          // --- CHANGE: Alternate primary and primary_darker based on column index (col) --- 
          assignedColorHex = (col % 2 === 0) 
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

  // --- Rendering with Subdivision --- 
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
          
          // --- Subdivision Calculations (2x2 grid) --- 
          const v00 = vertices[0]; // Top Left
          const v10 = vertices[1]; // Top Right
          const v11 = vertices[2]; // Bottom Right
          const v01 = vertices[3]; // Bottom Left

          // Interpolate midpoints of edges
          const v05_0 = lerpPoint(p, v00, v10, 0.5); // Mid Top
          const v1_05 = lerpPoint(p, v10, v11, 0.5); // Mid Right
          const v05_1 = lerpPoint(p, v11, v01, 0.5); // Mid Bottom (swapped order for consistency)
          const v0_05 = lerpPoint(p, v00, v01, 0.5); // Mid Left

          // Interpolate center point
          const v05_05 = lerpPoint(p, v0_05, v1_05, 0.5); // Center

          // Define UV coordinates for the 9 points
          const UV_EPSILON = config.textureUvEpsilon; 
          const uv00 = { u: UV_EPSILON, v: UV_EPSILON };
          const uv10 = { u: 1 - UV_EPSILON, v: UV_EPSILON };
          const uv11 = { u: 1 - UV_EPSILON, v: 1 - UV_EPSILON };
          const uv01 = { u: UV_EPSILON, v: 1 - UV_EPSILON };
          const uv05_0 = { u: 0.5, v: UV_EPSILON };
          const uv1_05 = { u: 1 - UV_EPSILON, v: 0.5 };
          const uv05_1 = { u: 0.5, v: 1 - UV_EPSILON };
          const uv0_05 = { u: UV_EPSILON, v: 0.5 };
          const uv05_05 = { u: 0.5, v: 0.5 };

          // Draw the 8 triangles forming the 2x2 grid
          p.beginShape(p.TRIANGLES);

          // Top-Left Quad
          p.vertex(v00.x, v00.y, uv00.u, uv00.v);
          p.vertex(v05_0.x, v05_0.y, uv05_0.u, uv05_0.v);
          p.vertex(v05_05.x, v05_05.y, uv05_05.u, uv05_05.v);

          p.vertex(v00.x, v00.y, uv00.u, uv00.v);
          p.vertex(v05_05.x, v05_05.y, uv05_05.u, uv05_05.v);
          p.vertex(v0_05.x, v0_05.y, uv0_05.u, uv0_05.v);

          // Top-Right Quad
          p.vertex(v05_0.x, v05_0.y, uv05_0.u, uv05_0.v);
          p.vertex(v10.x, v10.y, uv10.u, uv10.v);
          p.vertex(v1_05.x, v1_05.y, uv1_05.u, uv1_05.v);
          
          p.vertex(v05_0.x, v05_0.y, uv05_0.u, uv05_0.v);
          p.vertex(v1_05.x, v1_05.y, uv1_05.u, uv1_05.v);
          p.vertex(v05_05.x, v05_05.y, uv05_05.u, uv05_05.v);

          // Bottom-Left Quad
          p.vertex(v0_05.x, v0_05.y, uv0_05.u, uv0_05.v);
          p.vertex(v05_05.x, v05_05.y, uv05_05.u, uv05_05.v);
          p.vertex(v05_1.x, v05_1.y, uv05_1.u, uv05_1.v);

          p.vertex(v0_05.x, v0_05.y, uv0_05.u, uv0_05.v);
          p.vertex(v05_1.x, v05_1.y, uv05_1.u, uv05_1.v);
          p.vertex(v01.x, v01.y, uv01.u, uv01.v);

          // Bottom-Right Quad
          p.vertex(v05_05.x, v05_05.y, uv05_05.u, uv05_05.v);
          p.vertex(v1_05.x, v1_05.y, uv1_05.u, uv1_05.v);
          p.vertex(v11.x, v11.y, uv11.u, uv11.v);
          
          p.vertex(v05_05.x, v05_05.y, uv05_05.u, uv05_05.v);
          p.vertex(v11.x, v11.y, uv11.u, uv11.v);
          p.vertex(v05_1.x, v05_1.y, uv05_1.u, uv05_1.v);

          p.endShape(); // End TRIANGLES
          
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

function setupLines(p: p5) { 
  linePositions = [];
  originalPositions = [];
  targetLinePositions = [];
  previousLinePositions = [];
  columns = [];
  
  // Use columnsCount directly from config (now calculated based on textLines)
  const currentColumnsCount = config.columnsCount;
  const spacing = config.width / currentColumnsCount;

  for (let i = 0; i <= currentColumnsCount; i++) { // Use currentColumnsCount
    const xPos = i * spacing;
    linePositions.push(xPos);
    originalPositions.push(xPos);
    targetLinePositions.push(xPos); 
    previousLinePositions.push(xPos); 
  }

  // Initialize columns
  for (let i = 0; i < currentColumnsCount; i++) { // Use currentColumnsCount
    const leftX = linePositions[i];
    const rightX = linePositions[i + 1];
    const column = new Column(leftX, rightX, config.cellsCount, i, 0, config, p);
    column.setCellAmplitudeYFactor(config.cellVerticalAmplitudeFactor); 
    column.setCellAmplitudeXFactor(config.cellHorizontalAmplitudeFactor); 
    columns.push(column);
  }
  setupRectangles(); // Relies on columns being set up
}

// Create rectangles connecting cell centers
function setupRectangles() {
  rectangles = [];

  const minX = -config.outerEdgePadding;
  const maxX = config.width + config.outerEdgePadding;
  const minY = -config.outerEdgePadding;
  const maxY = config.height + config.outerEdgePadding;
  
  const currentColumnsCount = config.columnsCount; // Use config value
  const currentCellsCount = config.cellsCount;     // Use config value

  for (let i = 0; i <= currentColumnsCount; i++) {
    for (let j = 0; j <= currentCellsCount; j++) {
      const createRect =
        config.includeOuterEdges || (i < currentColumnsCount && j < currentCellsCount);

      if (createRect) {
        let topLeft: Point, topRight: Point, bottomRight: Point, bottomLeft: Point;

        // Top-left point
        if (i > 0 && j > 0) {
          topLeft = columns[i - 1].cells[j - 1].center;
        } else {
          const x = i === 0 ? minX : columns[i - 1].cells[0].centerX;
          const y = j === 0 ? minY : columns[0].cells[j - 1].centerY;
          topLeft = { x, y };
        }
        // Top-right point
        if (i < currentColumnsCount && j > 0) {
          topRight = columns[i].cells[j - 1].center;
        } else {
          const x = i >= currentColumnsCount ? maxX : columns[i].cells[0].centerX;
          const y = j === 0 ? minY : columns[0].cells[j - 1].centerY;
          topRight = { x, y };
        }
        // Bottom-right point
        if (i < currentColumnsCount && j < currentCellsCount) {
          bottomRight = columns[i].cells[j].center;
        } else {
          const x = i >= currentColumnsCount ? maxX : columns[i].cells[0].centerX;
          const y = j >= currentCellsCount ? maxY : columns[0].cells[j].centerY;
          bottomRight = { x, y };
        }
        // Bottom-left point
        if (i > 0 && j < currentCellsCount) {
          bottomLeft = columns[i - 1].cells[j].center;
        } else {
          const x = i === 0 ? minX : columns[i - 1].cells[0].centerX;
          const y = j >= currentCellsCount ? maxY : columns[0].cells[j].centerY;
          bottomLeft = { x, y };
        }

        const rect = new Rectangle(topLeft, topRight, bottomRight, bottomLeft);
        rect.setMetadata({ // This metadata structure is fine
          colTopLeft: i - 1, // 0-based grid cell col
          rowTopLeft: j - 1, // 0-based grid cell row
          colBottomRight: i,
          rowBottomRight: j,
          // isBorder/isWordArea removed as renderer now decides based on textLines
        });
        rectangles.push(rect);
      }
    }
  }
}

// Update rectangle vertices based on current cell centers
function updateRectangles() {
  // ... (logic seems okay, uses config.columnsCount/cellsCount and cell centers) ...
  // Uses metadata col/row indices correctly
  const currentColumnsCount = config.columnsCount;
  const currentCellsCount = config.cellsCount;
  const minX = -config.outerEdgePadding;
  const maxX = config.width + config.outerEdgePadding;
  const minY = -config.outerEdgePadding;
  const maxY = config.height + config.outerEdgePadding;

  for (const rect of rectangles) {
    const metadata = rect.getMetadata();
    if (metadata) {
      const { colTopLeft, rowTopLeft, colBottomRight, rowBottomRight } = metadata;
      let topLeft: Point, topRight: Point, bottomRight: Point, bottomLeft: Point;

      // Top-left point
      if (colTopLeft >= 0 && rowTopLeft >= 0 && colTopLeft < currentColumnsCount && rowTopLeft < currentCellsCount) {
        topLeft = columns[colTopLeft].cells[rowTopLeft].center;
      } else {
        const x = colTopLeft < 0 ? minX : columns[colTopLeft >= currentColumnsCount ? currentColumnsCount - 1 : colTopLeft].cells[0].centerX; // Safe access
        const y = rowTopLeft < 0 ? minY : columns[0].cells[rowTopLeft >= currentCellsCount ? currentCellsCount - 1 : rowTopLeft].centerY; // Safe access
        topLeft = { x, y };
      }
      // Top-right point
      if (colBottomRight >= 0 && rowTopLeft >= 0 && colBottomRight < currentColumnsCount && rowTopLeft < currentCellsCount) {
        topRight = columns[colBottomRight].cells[rowTopLeft].center;
      } else {
        const x = colBottomRight >= currentColumnsCount ? maxX : columns[colBottomRight < 0 ? 0 : colBottomRight].cells[0].centerX; // Safe access
        const y = rowTopLeft < 0 ? minY : columns[0].cells[rowTopLeft >= currentCellsCount ? currentCellsCount - 1 : rowTopLeft].centerY; // Safe access
        topRight = { x, y };
      }
      // Bottom-right point
      if (colBottomRight >= 0 && rowBottomRight >= 0 && colBottomRight < currentColumnsCount && rowBottomRight < currentCellsCount) {
        bottomRight = columns[colBottomRight].cells[rowBottomRight].center;
      } else {
        const x = colBottomRight >= currentColumnsCount ? maxX : columns[colBottomRight < 0 ? 0 : colBottomRight].cells[0].centerX; // Safe access
        const y = rowBottomRight >= currentCellsCount ? maxY : columns[0].cells[rowBottomRight < 0 ? 0 : rowBottomRight].centerY; // Safe access
        bottomRight = { x, y };
      }
      // Bottom-left point
      if (colTopLeft >= 0 && rowBottomRight >= 0 && colTopLeft < currentColumnsCount && rowBottomRight < currentCellsCount) {
        bottomLeft = columns[colTopLeft].cells[rowBottomRight].center;
      } else {
        const x = colTopLeft < 0 ? minX : columns[colTopLeft >= currentColumnsCount ? currentColumnsCount - 1 : colTopLeft].cells[0].centerX; // Safe access
        const y = rowBottomRight >= currentCellsCount ? maxY : columns[0].cells[rowBottomRight < 0 ? 0 : rowBottomRight].centerY; // Safe access
        bottomLeft = { x, y };
      }
      rect.setVertices(topLeft, topRight, bottomRight, bottomLeft);
    }
  }
}

// Function to calculate new random target line positions with constraints
function calculateNewTargetLinePositions(p: p5) {
    for (let i = 1; i < originalPositions.length - 1; i++) {
        const randomValue = p.random(-1, 1); // Random value from -1 to 1

        const distToLeft = originalPositions[i] - originalPositions[i-1];
        const distToRight = originalPositions[i+1] - originalPositions[i];
        
        // Allow movement almost up to the neighbor's original position, minus minWidth
        const maxDispLeft = distToLeft - config.minColumnWidth;
        const maxDispRight = distToRight - config.minColumnWidth;
        
        const baseAmplitude = (config.width / config.columnsCount) * config.columnDisplacementFactor;
        let displacement = randomValue * baseAmplitude;

        // Apply the relaxed displacement limits
        if (displacement < 0) { 
            displacement = Math.max(displacement, -maxDispLeft); // Limit by distance to left neighbor
        } else { 
            displacement = Math.min(displacement, maxDispRight); // Limit by distance to right neighbor
        }
        targetLinePositions[i] = originalPositions[i] + displacement;
    }
    // Keep start/end targets fixed
    targetLinePositions[0] = originalPositions[0];
    targetLinePositions[originalPositions.length - 1] = originalPositions[originalPositions.length - 1];
}

const animation: AnimationFunction = (p: p5, normalizedTime: number, currentFrameNum: number): void => {
  // --- Используем цвет фона из активной схемы ---
  p.background(activeColorScheme.background);
  p.translate(-config.width / 2, -config.height / 2);

  const updateInterval = config.updateIntervalFrames;
  const isUpdateFrame = currentFrameNum % updateInterval === 0;

  if (isUpdateFrame || currentFrameNum === 0) { 
      previousLinePositions = [...linePositions]; 
      calculateNewTargetLinePositions(p); // Calculate target column lines
      
      // Call updateCellTargets for each column, passing TARGET line positions
      columns.forEach((col, i) => 
          col.updateCellTargets(p, targetLinePositions[i], targetLinePositions[i + 1])
      );
  }

  // Calculate lerp factor for the current interval
  const progressInInterval = (currentFrameNum % updateInterval) / updateInterval;
  // Get and apply the selected easing function
  const activeEase = getActiveEasingFunction();
  const lerpFactor = activeEase(progressInInterval);

  // Interpolate column line positions
  for (let i = 0; i < linePositions.length; i++) {
      linePositions[i] = p.lerp(previousLinePositions[i], targetLinePositions[i], lerpFactor);
  }

  // Update columns: set current bounds and interpolate cell boundaries
  for (let i = 0; i < columns.length; i++) {
    const leftX = linePositions[i]; // Use INTERPOLATED line position
    const rightX = linePositions[i + 1]; // Use INTERPOLATED line position
    columns[i].setBounds(leftX, rightX); // Update column's current boundary knowledge
    columns[i].interpolateCellBoundaries(lerpFactor); // Interpolate the cells
  }

  updateRectangles(); // Update quads based on interpolated cell centers

  // Render rectangles
  rectangles.forEach((rect, index) => {
    const metadata = rect.getMetadata();
    if (metadata) {
      metadata.rectIndex = index;
      // Pass the original color argument (now unused) from the Rectangle object
      renderRectangle(p, normalizedTime, rect.getLines(), rect.getDiagonalIntersection(), rect.getVertices(), rect.getColor(), metadata);
    }
  });
};

const setupAnimation: AnimationFunction = (p: p5): void => {
  // --- Устанавливаем активную схему в начале --- 
  activeColorScheme = getActiveColorScheme(config.colorSchemeName);
  console.log(`Using color scheme: ${config.colorSchemeName}`);

  // --- Используем цвет фона из активной схемы --- 
  p.background(activeColorScheme.background);
  p.frameRate(config.fps);
  noise2D = createNoise2D(); 
  // cellAmplitude = config.height / config.cellsCount; // This variable seems unused now
  const selectedTextureSize = config.useHighResTextures ? config.textureSizeRender : config.textureSizePreview;
  console.log(`Using texture size: ${selectedTextureSize}x${selectedTextureSize}`);
  alphabetTextures = generateAlphabetTextures(p, selectedTextureSize, config.fontFamily, config.charsForTexture);
  
  setupLines(p); 

  console.log("Setup complete using config. Textures generated:", Object.keys(alphabetTextures).length);
  console.log("Rectangles created:", rectangles.length);
};

// Now declare the settings after animation is defined
export const settings: AnimationSettings = {
  id: "unstableGrid",
  name: "unstableGrid",

  fps: config.fps,
  width: config.width,
  height: config.height,
  totalFrames: config.durationInSeconds * config.fps,

  function: animation,
  onSetup: setupAnimation,
};
