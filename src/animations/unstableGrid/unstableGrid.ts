import p5 from "p5";
import { AnimationSettings, AnimationFunction } from "@/types/animations";
import { Column } from "./Columns";
import { createNoise2D } from "simplex-noise";
import {
  Rectangle,
  Line,
  Point,
  Color,
  RectangleRenderFunction,
  RectangleMetadata,
} from "./Rectangle";
import { generateAlphabetTextures } from "../../utils/textureUtils";
import { defaultConfig, UnstableGridConfig } from "./config"; // Import config

// --- Use values from config --- 
const config: UnstableGridConfig = defaultConfig; // Use default config for now

// --- Removed Constants (now in config) ---
// const DARK_PURPLE = ...
// const LIME_GREEN = ...
// const COLOR_PALETTE = ...
// let alphabetTextures = ...
// const CHARS_FOR_TEXTURES = ...
// const FPS = ...
// const WIDTH = ...
// const HEIGHT = ...
// const DURATION = ...
// export const columnsCount = ...
// export const cellsCount = ...
// const cellAmplitude = ...
// const columnNoiseOffset = ...
// const columnNoiseFrequency = ...
// const columnNoiseSpeed = ...
// const columnDisplacementFactor = ...
// const gridInsetColumns = ... // Not used?
// const gridInsetRows = ... // Not used?
// const includeOuterEdges = ...
// const outerEdgePadding = ...
// const TARGET_WORD = ...

// Global variable to hold the generated textures (still needed)
let alphabetTextures: Record<string, p5.Graphics> = {};

// Create a single noise generator for consistent values (still needed)
const noise2D = createNoise2D();

// Store line positions (still needed)
const linePositions: number[] = [];
const originalPositions: number[] = [];

// Store columns (still needed)
const columns: Column[] = [];

// Store rectangles for inner grid (still needed)
const rectangles: Rectangle[] = [];

// --- New Textured Rectangle Renderer (Uses config for colors/word) ---
const renderTexturedRectangle: RectangleRenderFunction = (
  p: p5,
  _normalizedTime: number,
  _lines: Line[],
  _intersection: Point | null,
  vertices: Point[],
  _color: Color,
  metadata: RectangleMetadata | null
): void => {
  // Extract necessary data from metadata
  const rectIndex = metadata?.rectIndex as number | undefined;
  const isBorder = metadata?.isBorder as boolean | undefined;
  const isWordArea = metadata?.isWordArea as boolean | undefined;
  const col = metadata?.colTopLeft; // 0-based column index (0-8)
  const row = metadata?.rowTopLeft; // 0-based row index (0-8)

  if (vertices.length !== 4 || rectIndex === undefined || col === undefined || row === undefined || isBorder === undefined) {
    return; // Need valid metadata
  }

  let letter: string | null = null;
  let assignedColorHex: string | null = null;

  // --- Determine Letter and Color based on Area (Use config) ---
  if (isBorder) {
    // Border area: Random character, Border color
    const charIndex = rectIndex % config.charsForTextures.length;
    letter = config.charsForTextures[charIndex];
    assignedColorHex = config.borderColor; // Use config color
  } else if (isWordArea) {
    // Word area: PARADOX (no shift), Alternating row colors
    // --- Letter Selection (Use config word) ---
    if (col >= 0 && col < config.targetWord.length) {
      letter = config.targetWord[col]; 
    } else {
      letter = '?'; 
    }
    // --- Color Selection (Use config colors) ---
    if (row % 2 === 0) { 
      assignedColorHex = config.wordColor1;
    } else { 
      assignedColorHex = config.wordColor2;
    }
  }

  // Proceed only if we determined a letter
  if (letter === null) {
      console.warn("Could not determine letter for quad at", col, row);
      return;
  }

  // Fetch the texture for the determined letter
  const texture = alphabetTextures[letter];

  if (texture) {
    p.push();

    // Apply tint (use determined color, default to white if somehow null)
    if (assignedColorHex) {
        p.tint(assignedColorHex);
    } else {
        p.tint(255); // Default to white if color assignment failed
    }

    p.textureMode(p.NORMAL);
    p.textureWrap(p.CLAMP);
    p.texture(texture);
    p.noStroke();

    // Adjust UVs slightly inward to avoid edge sampling issues
    const UV_EPSILON = 0.01; // Increased inset value slightly

    p.beginShape();
    // Top-Left vertex -> UV (epsilon, epsilon)
    p.vertex(vertices[0].x, vertices[0].y, UV_EPSILON, UV_EPSILON);
    // Top-Right vertex -> UV (1 - epsilon, epsilon)
    p.vertex(vertices[1].x, vertices[1].y, 1 - UV_EPSILON, UV_EPSILON);
    // Bottom-Right vertex -> UV (1 - epsilon, 1 - epsilon)
    p.vertex(vertices[2].x, vertices[2].y, 1 - UV_EPSILON, 1 - UV_EPSILON);
    // Bottom-Left vertex -> UV (epsilon, 1 - epsilon)
    p.vertex(vertices[3].x, vertices[3].y, UV_EPSILON, 1 - UV_EPSILON);
    p.endShape(p.CLOSE);

    p.noTint(); // Reset tint

    p.pop();
  } else {
    console.warn(`Texture not found for letter: ${letter}`);
  }
};

const renderRectangle: RectangleRenderFunction = renderTexturedRectangle;

function setupLines(p: p5, cfg: UnstableGridConfig) { // Accept config
  linePositions.length = 0;
  originalPositions.length = 0;
  columns.length = 0;

  // Use config values
  const spacing = cfg.WIDTH / cfg.columnsCount;

  for (let i = 0; i <= cfg.columnsCount; i++) {
    const xPos = i * spacing;
    linePositions.push(xPos);
    originalPositions.push(xPos);
  }

  for (let i = 0; i < cfg.columnsCount; i++) {
    const leftX = linePositions[i];
    const rightX = linePositions[i + 1];
    // Pass relevant config values to Column constructor
    const column = new Column(
      p, // Pass p5 instance if needed by Column
      leftX, 
      rightX, 
      cfg.cellsCount, 
      i, 
      0, // Initial progress
      {
        cellAmplitudeY: cfg.cellAmplitudeY,
        noiseOffsetY: cfg.cellNoiseOffsetY,
        cellNoiseFrequencyY: cfg.cellNoiseFrequencyY,
        cellNoiseSpeedY: cfg.cellNoiseSpeedY,
        minCellHeightPixels: cfg.minCellHeightPixels,
        cellAmplitudeXFactor: cfg.cellAmplitudeXFactor,
        cellNoiseOffsetX: cfg.cellNoiseOffsetX,
        cellNoiseFrequencyX: cfg.cellNoiseFrequencyX,
        cellNoiseSpeedX: cfg.cellNoiseSpeedX,
        cellPaddingXPixels: cfg.cellPaddingXPixels,
        totalHeight: cfg.HEIGHT,
        baseColumnWidth: cfg.WIDTH / cfg.columnsCount // Pass calculated base width
      } // Pass config object
    );

    columns.push(column);
  }

  setupRectangles(cfg); // Pass config
}

function setupRectangles(cfg: UnstableGridConfig) { // Accept config
  rectangles.length = 0;

  // Use config values
  const minX = -cfg.outerEdgePadding;
  const maxX = cfg.WIDTH + cfg.outerEdgePadding;
  const minY = -cfg.outerEdgePadding;
  const maxY = cfg.HEIGHT + cfg.outerEdgePadding;

  for (let i = 0; i <= cfg.columnsCount; i++) {
    for (let j = 0; j <= cfg.cellsCount; j++) {
      const createRect = cfg.includeOuterEdges || (i < cfg.columnsCount && j < cfg.cellsCount);

      if (createRect) {
        // ... (logic for getting/creating points, using cfg.WIDTH/HEIGHT/outerEdgePadding) ...
        // Inside the logic for virtual points, use cfg.WIDTH, cfg.HEIGHT, minX, maxX etc.
        // Example for Top-left virtual point:
        // const x = i === 0 ? minX : i > 0 ? columns[i - 1].cells[0].centerX : maxX;
        // const y = j === 0 ? minY : j > 0 ? columns[0].cells[j - 1].centerY : maxY;
        
        // --- Corrected logic for virtual points using config --- 
        let topLeft: Point;
        let topRight: Point;
        let bottomRight: Point;
        let bottomLeft: Point;

        // Top-left point
        if (i > 0 && j > 0) {
          topLeft = columns[i - 1].cells[j - 1].center;
        } else {
          const x = i === 0 ? minX : (i > 0 && columns[i - 1]?.cells[0]) ? columns[i - 1].cells[0].centerX : maxX; // Added check
          const y = j === 0 ? minY : (j > 0 && columns[0]?.cells[j - 1]) ? columns[0].cells[j - 1].centerY : maxY; // Added check
          topLeft = { x, y };
        }
        // ... (similar logic for topRight, bottomRight, bottomLeft using cfg values where needed) ...
        // Top-right point
        if (i < cfg.columnsCount && j > 0) {
          topRight = columns[i].cells[j - 1].center;
        } else {
          const x = i >= cfg.columnsCount ? maxX : (i < cfg.columnsCount && columns[i]?.cells[0]) ? columns[i].cells[0].centerX : minX;
          const y = j === 0 ? minY : (j > 0 && columns[0]?.cells[j - 1]) ? columns[0].cells[j - 1].centerY : maxY;
          topRight = { x, y };
        }
        // Bottom-right point
        if (i < cfg.columnsCount && j < cfg.cellsCount) {
          bottomRight = columns[i].cells[j].center;
        } else {
          const x = i >= cfg.columnsCount ? maxX : (i < cfg.columnsCount && columns[i]?.cells[j]) ? columns[i].cells[j].centerX : minX;
          const y = j >= cfg.cellsCount ? maxY : (j < cfg.cellsCount && columns[0]?.cells[j]) ? columns[0].cells[j].centerY : minY;
          bottomRight = { x, y };
        }
        // Bottom-left point
        if (i > 0 && j < cfg.cellsCount) {
          bottomLeft = columns[i - 1].cells[j].center;
        } else {
          const x = i === 0 ? minX : (i > 0 && columns[i - 1]?.cells[j]) ? columns[i - 1].cells[j].centerX : maxX;
          const y = j >= cfg.cellsCount ? maxY : (j < cfg.cellsCount && columns[0]?.cells[j]) ? columns[0].cells[j].centerY : minY; 
          bottomLeft = { x, y };
        }

        const rect = new Rectangle(topLeft, topRight, bottomRight, bottomLeft);
        const isBorder = i === 0 || i === cfg.columnsCount || j === 0 || j === cfg.cellsCount;
        const isWordArea = !isBorder;

        rect.setMetadata({
          colTopLeft: i - 1, // 0-based index for the actual cell/quad column
          rowTopLeft: j - 1, // 0-based index for the actual cell/quad row
          colBottomRight: i,
          rowBottomRight: j,
          isBorder: isBorder,
          isWordArea: isWordArea
        });
        rectangles.push(rect);
      }
    }
  }
}

function updateRectangles(cfg: UnstableGridConfig) { // Accept config
  for (const rect of rectangles) {
    const metadata = rect.getMetadata();
    if (metadata) {
      // ... (logic for getting points, using cfg values where needed) ...
      // Inside the logic for virtual points, use cfg.WIDTH, cfg.HEIGHT, minX, maxX etc.
      // --- Corrected logic for virtual points using config --- 
      const minX = -cfg.outerEdgePadding;
      const maxX = cfg.WIDTH + cfg.outerEdgePadding;
      const minY = -cfg.outerEdgePadding;
      const maxY = cfg.HEIGHT + cfg.outerEdgePadding;
      // ... (similar logic as in setupRectangles for getting/calculating points) ... 
       let topLeft: Point;
       let topRight: Point;
       let bottomRight: Point;
       let bottomLeft: Point;
       const { colTopLeft, rowTopLeft, colBottomRight, rowBottomRight } = metadata;

      // Top-left point
      if (colTopLeft >= 0 && rowTopLeft >= 0) {
        topLeft = columns[colTopLeft].cells[rowTopLeft].center;
      } else {
        const x = colTopLeft < 0 ? minX : (colTopLeft < columns.length && columns[colTopLeft]?.cells[0]) ? columns[colTopLeft].cells[0].centerX : maxX;
        const y = rowTopLeft < 0 ? minY : (rowTopLeft < columns[0]?.cells.length && columns[0]?.cells[rowTopLeft]) ? columns[0].cells[rowTopLeft].centerY : maxY;
        topLeft = { x, y };
      }
      // Top-right point
      if (colBottomRight >= 0 && rowTopLeft >= 0 && colBottomRight < columns.length) {
         topRight = columns[colBottomRight].cells[rowTopLeft].center;
      } else {
         const x = colBottomRight < 0 ? minX : (colBottomRight < columns.length && columns[colBottomRight]?.cells[0]) ? columns[colBottomRight].cells[0].centerX : maxX;
         const y = rowTopLeft < 0 ? minY : (rowTopLeft < columns[0]?.cells.length && columns[0]?.cells[rowTopLeft]) ? columns[0].cells[rowTopLeft].centerY : maxY;
         topRight = { x, y };
      }
      // Bottom-right point
      if (colBottomRight >= 0 && rowBottomRight >= 0 && colBottomRight < columns.length && rowBottomRight < columns[colBottomRight]?.cells.length) {
        bottomRight = columns[colBottomRight].cells[rowBottomRight].center;
      } else {
        const x = colBottomRight < 0 ? minX : (colBottomRight < columns.length && columns[colBottomRight]?.cells[0]) ? columns[colBottomRight].cells[0].centerX : maxX;
        const y = rowBottomRight < 0 ? minY : (rowBottomRight < columns[0]?.cells.length && columns[0]?.cells[rowBottomRight]) ? columns[0].cells[rowBottomRight].centerY : maxY;
        bottomRight = { x, y };
      }
      // Bottom-left point
      if (colTopLeft >= 0 && rowBottomRight >= 0 && rowBottomRight < columns[colTopLeft]?.cells.length) {
         bottomLeft = columns[colTopLeft].cells[rowBottomRight].center;
      } else {
        const x = colTopLeft < 0 ? minX : (colTopLeft < columns.length && columns[colTopLeft]?.cells[0]) ? columns[colTopLeft].cells[0].centerX : maxX;
        const y = rowBottomRight < 0 ? minY : (rowBottomRight < columns[0]?.cells.length && columns[0]?.cells[rowBottomRight]) ? columns[0].cells[rowBottomRight].centerY : maxY;
         bottomLeft = { x, y };
      }

      rect.setVertices(topLeft, topRight, bottomRight, bottomLeft);
    }
  }
}

// Main animation function (uses config)
const animation: AnimationFunction = (p: p5, normalizedTime: number, currentFrameNum: number): void => { 
  p.background(0);
  p.translate(-config.WIDTH / 2, -config.HEIGHT / 2);

  const isActive = normalizedTime > 0.001;
  
  // Update line positions using config
  for (let i = 1; i < linePositions.length - 1; i++) {
    if (isActive) {
      const noiseValue = noise2D(i * config.columnNoiseFrequency, normalizedTime * config.columnNoiseSpeed) * 2 - 1;
      const maxDisplacement = (config.WIDTH / config.columnsCount) * config.columnDisplacementFactor;
      let newPosition = originalPositions[i] + noiseValue * maxDisplacement;
      const minLeftX = linePositions[i - 1] + config.minColumnWidthPixels;
      const maxRightX = i < linePositions.length - 1 ? linePositions[i + 1] - config.minColumnWidthPixels : config.WIDTH;
      newPosition = p.max(minLeftX, p.min(maxRightX, newPosition));
      linePositions[i] = newPosition;
    } else {
      linePositions[i] = originalPositions[i];
    }
  }

  // Update columns using config values passed during setup
  for (let i = 0; i < columns.length; i++) {
    const leftX = linePositions[i];
    const rightX = linePositions[i + 1];
    columns[i].setBounds(leftX, rightX);
    columns[i].setGlobalProgress(normalizedTime); 
    columns[i].update(); // Column uses config passed in constructor
  }

  updateRectangles(config); // Pass config

  rectangles.forEach((rect, index) => {
    const metadata = rect.getMetadata();
    if (metadata) {
      metadata.rectIndex = index; 
      renderRectangle(p, normalizedTime, rect.getLines(), rect.getDiagonalIntersection(), rect.getVertices(), rect.getColor(), metadata );
    }
  });
};

// Setup function (uses config)
const setupAnimation: AnimationFunction = (p: p5): void => {
  p.background(0);
  p.frameRate(config.FPS);

  // Use config for texture generation (will be parameterized later)
  console.log(`Using font: ${config.fontName}, Texture size: ${config.textureSizePixels}x${config.textureSizePixels}`);
  alphabetTextures = generateAlphabetTextures(p, config.textureSizePixels, config.charsForTextures, config.fontName);

  setupLines(p, config); // Pass config

  console.log("Setup complete. Textures generated:", Object.keys(alphabetTextures).length);
  console.log("Rectangles created:", rectangles.length);
};

// Export settings (uses config for dimensions etc.)
export const settings: AnimationSettings = {
  id: "unstableGrid",
  name: "unstableGrid",

  fps: config.FPS,
  width: config.WIDTH,
  height: config.HEIGHT,
  totalFrames: config.DURATION_SECONDS * config.FPS,

  function: animation,
  onSetup: setupAnimation, 
};
