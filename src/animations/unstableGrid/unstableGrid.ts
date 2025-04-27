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

// --- Font Loading ---
// Remove preload logic - rely on CSS loading via index.html
// let cascadiaFont: p5.Font;
// const CASCADIA_CODE_URL = '...'; 
// function preloadAnimation(p: p5) { ... }

// --- Color Definitions ---
const DARK_PURPLE = "#6A0DAD";
const LIME_GREEN = "#32CD32";
const COLOR_PALETTE: string[] = [DARK_PURPLE, LIME_GREEN];

// Global variable to hold the generated textures
let alphabetTextures: Record<string, p5.Graphics> = {};
const CHARS_FOR_TEXTURES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Same chars as in generator

const FPS = 60;
const WIDTH = 1080;
const HEIGHT = 1920;
const DURATION = 30;

export const columnsCount = 8; // Export this constant
// Number of cells in each column
export const cellsCount = 8;   // Export this constant
// Amplitude of cell y-movement - Recalculate based on new columnsCount
const cellAmplitude = HEIGHT / cellsCount * 1; // Adjust amplitude based on cell height now
// Noise offset between columns (0 = synchronized, higher = more different)
const columnNoiseOffset = -20;

// Noise control parameters
// Frequency for column positioning (lower = smoother transitions)
const columnNoiseFrequency = 1.5; // Increased frequency for more erratic column movement
// Speed of column movement (lower = slower changes)
const columnNoiseSpeed = 25;     // Increased column speed
// Maximum displacement as a fraction of column width
const columnDisplacementFactor = 0.8; // Increased displacement significantly

// Inner grid settings
// Inset from edges in columns
const gridInsetColumns = 0;
// Inset from edges in rows
const gridInsetRows = 0;
// Add outer edge rectangles (за пределами видимой сетки)
const includeOuterEdges = true;
// Extra padding for outer points (pixels)
const outerEdgePadding = 150;

// Create a single noise generator for consistent values
const noise2D = createNoise2D();

// Store line positions
const linePositions: number[] = [];
const originalPositions: number[] = [];

// Store columns
const columns: Column[] = [];

// Store rectangles for inner grid
const rectangles: Rectangle[] = [];

// --- New Textured Rectangle Renderer ---
const TARGET_WORD = "PARADOX";
// const TARGET_COL = 1; // No longer needed

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
    // Border area: Random character, Purple color
    const charIndex = rectIndex % CHARS_FOR_TEXTURES.length;
    letter = CHARS_FOR_TEXTURES[charIndex];
    assignedColorHex = DARK_PURPLE;
  } else if (isWordArea) {
    // Word area: PARADOX (no shift), Alternating row colors
    
    // --- Letter Selection (No Shift) ---
    // Use col directly as the index into the word (0-6)
    if (col >= 0 && col < TARGET_WORD.length) {
      letter = TARGET_WORD[col]; 
    } else {
      // Fallback for safety, though col should be 0-6 here
      letter = '?'; 
    }
    
    // --- Color Selection (Alternating Rows) ---
    if (row % 2 === 0) { // Even rows (0, 2, 4, 6 relative to word area)
      assignedColorHex = LIME_GREEN;
    } else { // Odd rows (1, 3, 5 relative to word area)
      assignedColorHex = DARK_PURPLE;
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

// Use the new textured renderer instead of the default one
const renderRectangle: RectangleRenderFunction = renderTexturedRectangle;

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

    // --- Set vertical noise parameters (Y) --- 
    // Increase vertical amplitude, frequency, and speed
    const verticalAmplitudeFactor = 0.6; // Increased vertical amplitude
    column.setCellAmplitudeY(cellAmplitude * verticalAmplitudeFactor); 
    column.setNoiseOffsetY(columnNoiseOffset); 
    column.setCellNoiseFrequencyY(0.5); // Increased frequency Y
    column.setCellNoiseSpeedY(15);   // Increased speed Y

    // --- Set horizontal noise parameters (X) --- 
    // Increase horizontal amplitude, frequency, and speed
    const horizontalAmplitudeFactor = 0.8; // Increased horizontal amplitude
    column.setCellAmplitudeX(cellAmplitude * horizontalAmplitudeFactor); 
    column.setNoiseOffsetX(columnNoiseOffset + 0.5); // Keep separate offset
    column.setCellNoiseFrequencyX(0.6); // Increased frequency X
    column.setCellNoiseSpeedX(20);  // Increased speed X

    columns.push(column);
  }

  // Create rectangles based on cell centers
  setupRectangles();
}

// Create rectangles connecting cell centers
function setupRectangles() {
  rectangles.length = 0;

  const minX = -outerEdgePadding;
  const maxX = WIDTH + outerEdgePadding;
  const minY = -outerEdgePadding;
  const maxY = HEIGHT + outerEdgePadding;

  for (let i = 0; i <= columnsCount; i++) {
    for (let j = 0; j <= cellsCount; j++) {
      const createRect =
        includeOuterEdges || (i < columnsCount && j < cellsCount);

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
        if (i < columnsCount && j > 0) {
          topRight = columns[i].cells[j - 1].center;
        } else {
          // Create virtual point
          const x =
            i >= columnsCount
              ? maxX
              : i < columnsCount
              ? columns[i].cells[0].centerX
              : minX;
          const y =
            j === 0 ? minY : j > 0 ? columns[0].cells[j - 1].centerY : maxY;
          topRight = { x, y };
        }

        // Bottom-right point
        if (i < columnsCount && j < cellsCount) {
          bottomRight = columns[i].cells[j].center;
        } else {
          // Create virtual point
          const x =
            i >= columnsCount
              ? maxX
              : i < columnsCount
              ? columns[i].cells[0].centerX
              : minX;
          const y =
            j >= cellsCount
              ? maxY
              : j < cellsCount
              ? columns[0].cells[j].centerY
              : minY;
          bottomRight = { x, y };
        }

        // Bottom-left point
        if (i > 0 && j < cellsCount) {
          bottomLeft = columns[i - 1].cells[j].center;
        } else {
          // Create virtual point
          const x =
            i === 0 ? minX : i > 0 ? columns[i - 1].cells[0].centerX : maxX;
          const y =
            j >= cellsCount
              ? maxY
              : j < cellsCount
              ? columns[0].cells[j].centerY
              : minY;
          bottomLeft = { x, y };
        }

        const rect = new Rectangle(topLeft, topRight, bottomRight, bottomLeft);

        // --- Determine if border or word area ---
        const isBorder = i === 0 || i === columnsCount || j === 0 || j === cellsCount;
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
        isBorder,
      } = metadata;

      // Получаем актуальные центры ячеек или виртуальные точки
      let topLeft: Point;
      let topRight: Point;
      let bottomRight: Point;
      let bottomLeft: Point;

      // Обрабатываем случаи, когда нужны виртуальные точки за пределами сетки
      const minX = -outerEdgePadding;
      const maxX = WIDTH + outerEdgePadding;
      const minY = -outerEdgePadding;
      const maxY = HEIGHT + outerEdgePadding;

      // Top-left point
      if (
        colTopLeft >= 0 &&
        rowTopLeft >= 0 &&
        colTopLeft < columnsCount &&
        rowTopLeft < cellsCount
      ) {
        topLeft = columns[colTopLeft].cells[rowTopLeft].center;
      } else {
        // Virtual point
        const x =
          colTopLeft < 0
            ? minX
            : colTopLeft >= columnsCount
            ? maxX
            : columns[colTopLeft].cells[0].centerX;
        const y =
          rowTopLeft < 0
            ? minY
            : rowTopLeft >= cellsCount
            ? maxY
            : columns[0].cells[rowTopLeft].centerY;
        topLeft = { x, y };
      }

      // Top-right point
      if (
        colBottomRight >= 0 &&
        rowTopLeft >= 0 &&
        colBottomRight < columnsCount &&
        rowTopLeft < cellsCount
      ) {
        topRight = columns[colBottomRight].cells[rowTopLeft].center;
      } else {
        // Virtual point
        const x =
          colBottomRight < 0
            ? minX
            : colBottomRight >= columnsCount
            ? maxX
            : columns[colBottomRight].cells[0].centerX;
        const y =
          rowTopLeft < 0
            ? minY
            : rowTopLeft >= cellsCount
            ? maxY
            : columns[0].cells[rowTopLeft].centerY;
        topRight = { x, y };
      }

      // Bottom-right point
      if (
        colBottomRight >= 0 &&
        rowBottomRight >= 0 &&
        colBottomRight < columnsCount &&
        rowBottomRight < cellsCount
      ) {
        bottomRight = columns[colBottomRight].cells[rowBottomRight].center;
      } else {
        // Virtual point
        const x =
          colBottomRight < 0
            ? minX
            : colBottomRight >= columnsCount
            ? maxX
            : columns[colBottomRight].cells[0].centerX;
        const y =
          rowBottomRight < 0
            ? minY
            : rowBottomRight >= cellsCount
            ? maxY
            : columns[0].cells[rowBottomRight].centerY;
        bottomRight = { x, y };
      }

      // Bottom-left point
      if (
        colTopLeft >= 0 &&
        rowBottomRight >= 0 &&
        colTopLeft < columnsCount &&
        rowBottomRight < cellsCount
      ) {
        bottomLeft = columns[colTopLeft].cells[rowBottomRight].center;
      } else {
        // Virtual point
        const x =
          colTopLeft < 0
            ? minX
            : colTopLeft >= columnsCount
            ? maxX
            : columns[colTopLeft].cells[0].centerX;
        const y =
          rowBottomRight < 0
            ? minY
            : rowBottomRight >= cellsCount
            ? maxY
            : columns[0].cells[rowBottomRight].centerY;
        bottomLeft = { x, y };
      }

      // Обновляем только вершины, сохраняя тот же объект и его цвет
      rect.setVertices(topLeft, topRight, bottomRight, bottomLeft);
    }
  }
}

const animation: AnimationFunction = (p: p5, normalizedTime: number): void => {
  p.background(0); // Clear background each frame

  // --- BEGIN WEBGL Coordinate System Adjustment ---
  // Translate the coordinate system so (0,0) is the top-left corner
  p.translate(-p.width / 2, -p.height / 2);
  // --- END WEBGL Coordinate System Adjustment ---

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
      newPosition = p.max(minLeftX, p.min(maxRightX, newPosition)); // Use p.max/p.min

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

  // Update rectangles based on current cell centers
  updateRectangles();

  // Рендеринг всех четырехугольников с использованием renderRectangle (который теперь renderTexturedRectangle)
  rectangles.forEach((rect, index) => {
    const metadata = rect.getMetadata();
    if (metadata) {
      // Add index to metadata before calling
      metadata.rectIndex = index; 
      renderRectangle(
        p, 
        normalizedTime, 
        rect.getLines(), 
        rect.getDiagonalIntersection(), 
        rect.getVertices(), 
        rect.getColor(), 
        metadata // Metadata now includes rectIndex
      );
    }
  });
};

const setupAnimation: AnimationFunction = (p: p5): void => {
  p.background(0);
  p.frameRate(FPS);

  // --- Removed dynamic texture size calculation --- 
  const finalTextureSize = 256; // Set fixed texture size
  console.log(`Using fixed texture size: ${finalTextureSize}x${finalTextureSize}`);
  // --- End Calculation ---

  // Generate alphabet textures ONCE during setup using fixed size
  alphabetTextures = generateAlphabetTextures(p, finalTextureSize);

  setupLines(); // This now also calls setupRectangles internally

  console.log(
    "Setup complete. Textures generated:",
    Object.keys(alphabetTextures).length
  );
  console.log("Rectangles created:", rectangles.length);
};

// Now declare the settings after animation is defined
export const settings: AnimationSettings = {
  id: "unstableGrid",
  name: "unstableGrid",

  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  totalFrames: DURATION * FPS,

  // preload: preloadAnimation, // Remove preload from settings
  function: animation,
  onSetup: setupAnimation, // Ensure this setup function is used
};
