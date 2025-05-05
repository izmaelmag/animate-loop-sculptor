import { createCanvas, registerFont } from "canvas";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration (Simplified & Self-Contained) ---
// Characters to generate textures for (Modify this string as needed!)
const CHARS_TO_RENDER_STRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
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
  // 1. Create final 512x512 canvas
  const finalCanvas = createCanvas(FINAL_TEXTURE_SIZE, FINAL_TEXTURE_SIZE);
  const finalCtx = finalCanvas.getContext("2d");

  try {
    // 2. Set reference font size and get metrics
    const refFontSize = 500; // Large reference size
    finalCtx.font = `${refFontSize}px \"${FONT_FAMILY_NAME}\"`;
    const metrics = finalCtx.measureText(char);
    
    const measuredWidth = metrics.width;
    // Use actualBoundingBox for height as it's tighter than font ascent/descent
    const measuredHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    // Handle cases where measurement might fail (e.g., empty char, font issue)
    if (!measuredWidth || !measuredHeight || measuredWidth <= 0 || measuredHeight <= 0) {
        // console.log(`Character '${char}' has zero dimensions, saving empty texture.`);
         // Leave canvas transparent
    } else {
        // 3. Calculate scale factor to fit the measured dimensions
        const paddingFactor = 0.95; // Use 95% of the space to avoid touching edges directly
        const targetSize = FINAL_TEXTURE_SIZE * paddingFactor;
        const scaleFactor = Math.min(targetSize / measuredWidth, targetSize / measuredHeight);
        
        // 4. Calculate final font size
        const finalFontSize = refFontSize * scaleFactor;
        
        // 5. Set final font properties and draw centered
        finalCtx.font = `${finalFontSize}px \"${FONT_FAMILY_NAME}\"`;
        finalCtx.textAlign = "center";
        finalCtx.textBaseline = "middle";
        finalCtx.fillStyle = "white";
        finalCtx.fillText(char, FINAL_TEXTURE_SIZE / 2, FINAL_TEXTURE_SIZE / 2);
    }
    
  } catch(measureError) {
      console.error(`Error measuring char '${char}': ${measureError}. Skipping.`);
      errorCount++;
      continue; // Skip saving for this char
  }

  // 6. Save the final 512x512 canvas
  const filename = sanitizeFilename(char);
  const outputPath = path.join(OUTPUT_DIR, `${filename}.png`);
  textureMap[char] = `${filename}.png`;

  try {
    const buffer = finalCanvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);
    generatedCount++;
  } catch (err) {
    console.error(
      `Failed to save texture for character "${char}" (${filename}): ${err instanceof Error ? err.message : err}`
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
