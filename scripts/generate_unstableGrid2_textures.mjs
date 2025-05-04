import { createCanvas, registerFont } from "canvas";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration (Simplified & Self-Contained) ---
// Characters to generate textures for (Modify this string as needed!)
const CHARS_TO_RENDER_STRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
const CHARS_TO_RENDER = new Set(CHARS_TO_RENDER_STRING.split(""));

const FONT_FILENAME = "font.ttf"; // Expected font filename IN THE SAME DIRECTORY as the script
const FONT_FAMILY_NAME = "ScriptFont"; // Arbitrary name for registering
const FONT_PATH = path.resolve(__dirname, FONT_FILENAME);

const TEMP_CANVAS_SIZE = 1024; // Larger temporary canvas for initial drawing
const FINAL_TEXTURE_SIZE = 512; // Final texture size
const OUTPUT_DIR = path.resolve(__dirname, "generated_textures"); // Output directory NEXT TO the script

// --- Collect Characters (Now uses the hardcoded string) ---
console.log("Using predefined character set...");

if (CHARS_TO_RENDER.size === 0) {
  console.error(
    "Character string is empty. Please define characters in CHARS_TO_RENDER_STRING."
  );
  process.exit(1); // Exit if no chars defined
}

console.log(`Will generate textures for ${CHARS_TO_RENDER.size} characters.`);

// --- Prepare Output Directory ---
if (!fs.existsSync(OUTPUT_DIR)) {
  console.log(`Creating output directory: ${OUTPUT_DIR}`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
} else {
  console.log(`Output directory already exists: ${OUTPUT_DIR}`);
}

// --- Register Font ---
try {
  if (fs.existsSync(FONT_PATH)) {
    registerFont(FONT_PATH, { family: FONT_FAMILY_NAME }); // Use the defined family name
    console.log(`Registered font '${FONT_FAMILY_NAME}' from ${FONT_PATH}`);
  } else {
    console.error(
      `Font file not found at ${FONT_PATH}. Please place ${FONT_FILENAME} in the scripts directory.`
    );
    process.exit(1);
  }
} catch (error) {
  console.error(
    `Error registering font: ${error instanceof Error ? error.message : error}`
  );
  console.warn(
    `Proceeding without registered font might lead to incorrect rendering.`
  );
  // Decide if you want to exit or proceed with fallback
  // process.exit(1);
}

// --- Generate Textures ---
console.log(
  `Generating ${CHARS_TO_RENDER.size} textures (${FINAL_TEXTURE_SIZE}x${FINAL_TEXTURE_SIZE})...`
);
const startTime = Date.now();

let generatedCount = 0;
let errorCount = 0;
// --- NEW: Object to store the mapping ---
const textureMap = {};

// Function to sanitize character for filename
function sanitizeFilename(char) {
  const charCode = char.charCodeAt(0);
  if (char.match(/[a-zA-Z0-9\-_]/)) {
    return `char_${char}`;
  } else {
    // Use hex code for problematic characters
    return `char_hex_${charCode.toString(16).toUpperCase()}`;
  }
}

for (const char of CHARS_TO_RENDER) {
  // 1. Draw on temporary large canvas
  const tempCanvas = createCanvas(TEMP_CANVAS_SIZE, TEMP_CANVAS_SIZE);
  const tempCtx = tempCanvas.getContext("2d");

  tempCtx.fillStyle = "white";
  tempCtx.textAlign = "center";
  tempCtx.textBaseline = "middle";
  const initialFontSize = TEMP_CANVAS_SIZE * 0.8; // Large font on temp canvas
  tempCtx.font = `${initialFontSize}px "${FONT_FAMILY_NAME}"`;
  tempCtx.fillText(char, TEMP_CANVAS_SIZE / 2, TEMP_CANVAS_SIZE / 2);

  // 2. Find Bounding Box on temporary canvas
  let minX = TEMP_CANVAS_SIZE,
    minY = TEMP_CANVAS_SIZE,
    maxX = -1,
    maxY = -1;
  let isEmpty = true;
  try {
    const imageData = tempCtx.getImageData(
      0,
      0,
      TEMP_CANVAS_SIZE,
      TEMP_CANVAS_SIZE
    );
    const data = imageData.data;
    for (let y = 0; y < TEMP_CANVAS_SIZE; y++) {
      for (let x = 0; x < TEMP_CANVAS_SIZE; x++) {
        const alphaIndex = (y * TEMP_CANVAS_SIZE + x) * 4 + 3;
        if (data[alphaIndex] > 0) {
          // Check alpha
          isEmpty = false;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
  } catch (imgErr) {
    console.error(
      `Error getting image data for char '${char}': ${imgErr}. Skipping.`
    );
    errorCount++;
    continue;
  }

  // 4. Create final 512x512 canvas
  const finalCanvas = createCanvas(FINAL_TEXTURE_SIZE, FINAL_TEXTURE_SIZE);
  const finalCtx = finalCanvas.getContext("2d");

  // 3. Handle empty character
  if (isEmpty || maxX < minX || maxY < minY) {
    // console.log(`Character '${char}' is empty, saving empty 512x512 texture.`);
    // finalCanvas is already transparent, do nothing else
  } else {
    // 5. Copy and STRETCH the cropped portion to the final canvas
    const tightWidth = maxX - minX + 1;
    const tightHeight = maxY - minY + 1;

    // console.log(`Drawing char '${char}' from [${minX},${minY},${tightWidth},${tightHeight}] to [0,0,${FINAL_TEXTURE_SIZE},${FINAL_TEXTURE_SIZE}]`);

    finalCtx.drawImage(
      tempCanvas, // Source: temporary canvas
      minX,
      minY, // Source coords (top-left of bounding box)
      tightWidth,
      tightHeight, // Source dimensions (tight bounding box)
      0,
      0, // Destination coords (top-left of final canvas)
      FINAL_TEXTURE_SIZE,
      FINAL_TEXTURE_SIZE // Destination dimensions (STRETCH to fill)
    );
  }

  // 6. Save the final 512x512 canvas
  const filename = sanitizeFilename(char);
  const outputPath = path.join(OUTPUT_DIR, `${filename}.png`);
  // --- NEW: Add entry to the map ---
  textureMap[char] = `${filename}.png`;

  try {
    const buffer = finalCanvas.toBuffer("image/png"); // Save final canvas
    fs.writeFileSync(outputPath, buffer);
    generatedCount++;
    // console.log(` -> Saved ${outputPath}`); // Optional: log each file
  } catch (err) {
    console.error(
      `Failed to save texture for character "${char}" (${filename}): ${
        err instanceof Error ? err.message : err
      }`
    );
    errorCount++;
  }
}

const endTime = Date.now();
const duration = ((endTime - startTime) / 1000).toFixed(2);

console.log("--- Texture Generation Complete ---");
console.log(`Generated: ${generatedCount}`);
console.log(`Errors:    ${errorCount}`);
console.log(`Duration:  ${duration} seconds`);
if (errorCount > 0) {
  console.warn("Some textures failed to generate. Check errors above.");
}

// --- NEW: Write the map.json file ---
try {
  const mapPath = path.join(OUTPUT_DIR, "map.json");
  fs.writeFileSync(mapPath, JSON.stringify(textureMap, null, 2));
  console.log(`Texture map saved to: ${mapPath}`);
} catch (err) {
  console.error(
    `Failed to save texture map: ${err instanceof Error ? err.message : err}`
  );
}
