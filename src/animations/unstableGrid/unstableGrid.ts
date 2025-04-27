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
import { config } from "./config"; // Import config

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

// --- Removed noise generator, line/column/rect arrays (will be initialized in setup) ---
// const noise2D = createNoise2D();
// const linePositions: number[] = [];
// const originalPositions: number[] = [];
// const columns: Column[] = [];
// const rectangles: Rectangle[] = [];
let noise2D: ReturnType<typeof createNoise2D>;
let linePositions: number[] = [];
let originalPositions: number[] = [];
let columns: Column[] = [];
let rectangles: Rectangle[] = [];
let alphabetTextures: Record<string, p5.Graphics> = {};

// --- Updated Textured Rectangle Renderer ---
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

  // --- Determine Letter and Color based on Area ---
  if (isBorder) {
    const charIndex = rectIndex % config.charsForTexture.length;
    letter = config.charsForTexture[charIndex];
    assignedColorHex = config.colorPalette.secondary; // Use secondary color for border
  } else if (isWordArea) {
    if (col >= 0 && col < config.targetWord.length) {
      letter = config.targetWord[col]; 
    } else {
      letter = '?'; 
    }
    if (row % 2 === 0) { 
      assignedColorHex = config.colorPalette.primary; // Use primary for even rows
    } else { 
      assignedColorHex = config.colorPalette.secondary; // Use secondary for odd rows
    }
  }

  if (letter === null) {
      console.warn("Could not determine letter for quad at", col, row);
      return;
  }

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
    
    const UV_EPSILON = config.textureUvEpsilon; // Use config value
    p.beginShape();
    p.vertex(vertices[0].x, vertices[0].y, UV_EPSILON, UV_EPSILON);
    p.vertex(vertices[1].x, vertices[1].y, 1 - UV_EPSILON, UV_EPSILON);
    p.vertex(vertices[2].x, vertices[2].y, 1 - UV_EPSILON, 1 - UV_EPSILON);
    p.vertex(vertices[3].x, vertices[3].y, UV_EPSILON, 1 - UV_EPSILON);
    p.endShape(p.CLOSE);
    p.noTint();
    p.pop();
  } else {
    console.warn(`Texture not found for letter: ${letter}`);
  }
};

// Use the new textured renderer instead of the default one
const renderRectangle: RectangleRenderFunction = renderTexturedRectangle;

function setupLines() {
  linePositions = [];
  originalPositions = [];
  columns = [];
  
  const spacing = config.width / config.columnsCount;

  for (let i = 0; i <= config.columnsCount; i++) {
    const xPos = i * spacing;
    linePositions.push(xPos);
    originalPositions.push(xPos);
  }

  for (let i = 0; i < config.columnsCount; i++) {
    const leftX = linePositions[i];
    const rightX = linePositions[i + 1];
    // Pass config height to constructor or ensure Column reads it
    const column = new Column(leftX, rightX, config.cellsCount, i, 0, config);

    // Set noise parameters from config
    column.setCellAmplitudeY(cellAmplitude * config.cellVerticalAmplitudeFactor);
    column.setNoiseOffsetY(config.cellNoiseOffsetY); 
    column.setCellNoiseFrequencyY(config.cellNoiseFrequencyY);
    column.setCellNoiseSpeedY(config.cellNoiseSpeedY);

    column.setCellAmplitudeX(cellAmplitude * config.cellHorizontalAmplitudeFactor);
    column.setNoiseOffsetX(config.cellNoiseOffsetX); 
    column.setCellNoiseFrequencyX(config.cellNoiseFrequencyX);
    column.setCellNoiseSpeedX(config.cellNoiseSpeedX);

    columns.push(column);
  }
  setupRectangles();
}

// Create rectangles connecting cell centers
function setupRectangles() {
  rectangles = [];

  const minX = -config.outerEdgePadding;
  const maxX = config.width + config.outerEdgePadding;
  const minY = -config.outerEdgePadding;
  const maxY = config.height + config.outerEdgePadding;

  for (let i = 0; i <= config.columnsCount; i++) {
    for (let j = 0; j <= config.cellsCount; j++) {
      const createRect =
        config.includeOuterEdges || (i < config.columnsCount && j < config.cellsCount);

      if (createRect) {
        // Get or create cell centers
        let topLeft: Point;
        let topRight: Point;
        let bottomRight: Point;
        let bottomLeft: Point;

        // Top-left point
        if (i > 0 && j > 0) {
          topLeft = columns[i - 1].cells[j - 1].center;
        } else {
          // Create virtual point outside the grid
          const x =
            i === 0 ? minX : i > 0 ? columns[i - 1].cells[0].centerX : maxX;
          const y =
            j === 0 ? minY : j > 0 ? columns[0].cells[j - 1].centerY : maxY;
          topLeft = { x, y };
        }

        // Top-right point
        if (i < config.columnsCount && j > 0) {
          topRight = columns[i].cells[j - 1].center;
        } else {
          // Create virtual point
          const x =
            i >= config.columnsCount
              ? maxX
              : i < config.columnsCount
              ? columns[i].cells[0].centerX
              : minX;
          const y =
            j === 0 ? minY : j > 0 ? columns[0].cells[j - 1].centerY : maxY;
          topRight = { x, y };
        }

        // Bottom-right point
        if (i < config.columnsCount && j < config.cellsCount) {
          bottomRight = columns[i].cells[j].center;
        } else {
          // Create virtual point
          const x =
            i >= config.columnsCount
              ? maxX
              : i < config.columnsCount
              ? columns[i].cells[0].centerX
              : minX;
          const y =
            j >= config.cellsCount
              ? maxY
              : j < config.cellsCount
              ? columns[0].cells[j].centerY
              : minY;
          bottomRight = { x, y };
        }

        // Bottom-left point
        if (i > 0 && j < config.cellsCount) {
          bottomLeft = columns[i - 1].cells[j].center;
        } else {
          // Create virtual point
          const x =
            i === 0 ? minX : i > 0 ? columns[i - 1].cells[0].centerX : maxX;
          const y =
            j >= config.cellsCount
              ? maxY
              : j < config.cellsCount
              ? columns[0].cells[j].centerY
              : minY;
          bottomLeft = { x, y };
        }

        const rect = new Rectangle(topLeft, topRight, bottomRight, bottomLeft);

        // --- Determine if border or word area ---
        const isBorder = i === 0 || i === config.columnsCount || j === 0 || j === config.cellsCount;
        const isWordArea = !isBorder;

        // --- Set Metadata ---
        rect.setMetadata({
          colTopLeft: i - 1, // 0-based index for the actual cell/quad column
          rowTopLeft: j - 1, // 0-based index for the actual cell/quad row
          colBottomRight: i,
          rowBottomRight: j,
          isBorder: isBorder,
          isWordArea: isWordArea
          // Remove assignedColor - it will be determined in the renderer
        });

        rectangles.push(rect);
      }
    }
  }
}

// Update rectangle vertices based on current cell centers
function updateRectangles() {
  // Обновляем существующие прямоугольники вместо пересоздания
  for (const rect of rectangles) {
    const metadata = rect.getMetadata();

    if (metadata) {
      const {
        colTopLeft,
        rowTopLeft,
        colBottomRight,
        rowBottomRight,
      } = metadata; // Removed isBorder from destructuring as it's not used here

      // Получаем актуальные центры ячеек или виртуальные точки
      let topLeft: Point;
      let topRight: Point;
      let bottomRight: Point;
      let bottomLeft: Point;

      // Обрабатываем случаи, когда нужны виртуальные точки за пределами сетки
      const minX = -config.outerEdgePadding;
      const maxX = config.width + config.outerEdgePadding;
      const minY = -config.outerEdgePadding;
      const maxY = config.height + config.outerEdgePadding;

      // Top-left point
      if (
        colTopLeft >= 0 &&
        rowTopLeft >= 0 &&
        colTopLeft < config.columnsCount &&
        rowTopLeft < config.cellsCount
      ) {
        topLeft = columns[colTopLeft].cells[rowTopLeft].center;
      } else {
        // Virtual point
        const x =
          colTopLeft < 0
            ? minX
            : colTopLeft >= config.columnsCount
            ? maxX
            : columns[colTopLeft].cells[0].centerX; // Use correct index
        const y =
          rowTopLeft < 0
            ? minY
            : rowTopLeft >= config.cellsCount
            ? maxY
            : columns[0].cells[rowTopLeft].centerY; // Use correct index
        topLeft = { x, y };
      }

      // Top-right point
      if (
        colBottomRight >= 0 &&
        rowTopLeft >= 0 &&
        colBottomRight < config.columnsCount &&
        rowTopLeft < config.cellsCount
      ) {
        topRight = columns[colBottomRight].cells[rowTopLeft].center;
      } else {
        // Virtual point
        const x =
          colBottomRight < 0
            ? minX
            : colBottomRight >= config.columnsCount
            ? maxX
            : columns[colBottomRight].cells[0].centerX; // Use correct index
        const y =
          rowTopLeft < 0
            ? minY
            : rowTopLeft >= config.cellsCount
            ? maxY
            : columns[0].cells[rowTopLeft].centerY; // Use correct index
        topRight = { x, y };
      }

      // Bottom-right point
      if (
        colBottomRight >= 0 &&
        rowBottomRight >= 0 &&
        colBottomRight < config.columnsCount &&
        rowBottomRight < config.cellsCount
      ) {
        bottomRight = columns[colBottomRight].cells[rowBottomRight].center;
      } else {
        // Virtual point
        const x =
          colBottomRight < 0
            ? minX
            : colBottomRight >= config.columnsCount
            ? maxX
            : columns[colBottomRight].cells[0].centerX; // Use correct index
        const y =
          rowBottomRight < 0
            ? minY
            : rowBottomRight >= config.cellsCount
            ? maxY
            : columns[0].cells[rowBottomRight].centerY; // Use correct index
        bottomRight = { x, y };
      }

      // Bottom-left point
      if (
        colTopLeft >= 0 &&
        rowBottomRight >= 0 &&
        colTopLeft < config.columnsCount &&
        rowBottomRight < config.cellsCount
      ) {
        bottomLeft = columns[colTopLeft].cells[rowBottomRight].center;
      } else {
        // Virtual point
        const x =
          colTopLeft < 0
            ? minX
            : colTopLeft >= config.columnsCount
            ? maxX
            : columns[colTopLeft].cells[0].centerX; // Use correct index
        const y =
          rowBottomRight < 0
            ? minY
            : rowBottomRight >= config.cellsCount
            ? maxY
            : columns[0].cells[rowBottomRight].centerY; // Use correct index
        bottomLeft = { x, y };
      }

      // Обновляем только вершины, сохраняя тот же объект и его цвет
      rect.setVertices(topLeft, topRight, bottomRight, bottomLeft);
    }
  }
}

const animation: AnimationFunction = (p: p5, normalizedTime: number, currentFrameNum: number, totalFrames: number): void => {
  // Restore background and translate for WebGL
  p.background(0);
  p.translate(-config.width / 2, -config.height / 2);

  // --- Restore Original Animation Logic ---
  const isActive = normalizedTime > 0.001;
  // Update line positions based on noise
  for (let i = 1; i < linePositions.length - 1; i++) {
    if (isActive) {
      const noiseValue =
        noise2D(i * config.columnNoiseFrequency, normalizedTime * config.columnNoiseSpeed) *
          2 -
        1;
      const maxDisplacement = (config.width / config.columnsCount) * config.columnDisplacementFactor;
      let newPosition = originalPositions[i] + noiseValue * maxDisplacement;
      const minLeftX = linePositions[i - 1] + config.minColumnWidth;
      const maxRightX =
        i < linePositions.length - 1
          ? linePositions[i + 1] - config.minColumnWidth
          : config.width;
      newPosition = p.max(minLeftX, p.min(maxRightX, newPosition));
      linePositions[i] = newPosition;
    } else {
      linePositions[i] = originalPositions[i];
    }
  }
  // Update columns based on line positions
  for (let i = 0; i < columns.length; i++) {
    const leftX = linePositions[i];
    const rightX = linePositions[i + 1];
    columns[i].setBounds(leftX, rightX);
    // --- Use original normalizedTime for progress --- 
    columns[i].setGlobalProgress(normalizedTime); // Use original normalizedTime
    // --- End progress setting ---
    columns[i].update();
  }
  // Update rectangles based on current cell centers
  updateRectangles();
  // Рендеринг всех четырехугольников
  rectangles.forEach((rect, index) => {
    const metadata = rect.getMetadata();
    if (metadata) {
      metadata.rectIndex = index; // Assign index for renderer
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
  // --- End Restored Logic ---
};

const setupAnimation: AnimationFunction = (p: p5): void => {
  p.background(0);
  p.frameRate(config.fps);
  noise2D = createNoise2D(); 
  cellAmplitude = config.height / config.cellsCount; 
  
  // Select texture size based on config flag
  const selectedTextureSize = config.useHighResTextures 
                              ? config.textureSizeRender 
                              : config.textureSizePreview;
                              
  console.log(`Using texture size: ${selectedTextureSize}x${selectedTextureSize}`); // Log selected size

  // Pass selected size and other config values
  alphabetTextures = generateAlphabetTextures(
    p, 
    selectedTextureSize, // Use selected size
    config.fontFamily, 
    config.charsForTexture
  );
  setupLines(); 

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
