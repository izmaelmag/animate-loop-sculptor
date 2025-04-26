import p5 from "p5";

/**
 * Creates a p5.Graphics texture for a given letter, cropped to the letter bounds
 * and stretched to fill a standard square size without internal padding.
 * 
 * IMPORTANT: Assumes the main p5 sketch is running in WEBGL mode.
 * 
 * @param {p5} p The p5 instance.
 * @param {string} letter The character to render.
 * @param {number} [size=256] The final texture dimension (size x size).
 * @returns {p5.Graphics | null} The generated texture, or null if creation failed.
 */
export function createLetterTexture(p: p5, letter: string, size: number = 256): p5.Graphics | null {
    // 1. Initial Graphics buffer
    let pg1: p5.Graphics;
    try {
        pg1 = p.createGraphics(size, size);
    } catch (e) {
        console.error(`Failed to create graphics buffer for letter '${letter}':`, e);
        return null;
    }

    pg1.pixelDensity(1);
    pg1.background(255, 0);
    pg1.fill(255);
    pg1.textAlign(p.CENTER, p.CENTER);
    pg1.textSize(size * 0.85);
    pg1.textFont('Cascadia Code');
    pg1.text(letter, size / 2, size / 2);

    // 2. Find Bounding Box (without extra padding)
    pg1.loadPixels();
    if (!pg1.pixels || pg1.pixels.length === 0) {
        console.warn(`Failed to load pixels for letter "${letter}". Returning empty texture.`);
        pg1.remove();
        const emptyPg = p.createGraphics(size, size);
        emptyPg.background(0, 0);
        return emptyPg;
    }

    let minX = size, minY = size, maxX = -1, maxY = -1;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const index = (y * size + x) * 4;
            const alpha = pg1.pixels[index + 3];
            if (alpha > 20) {
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
            }
        }
    }

    if (maxX === -1 || minX === size) {
        console.warn(`No significant pixels found for letter "${letter}". Returning empty texture.`);
        pg1.remove();
        const emptyPg = p.createGraphics(size, size);
        emptyPg.background(0, 0);
        return emptyPg;
    }

    // Calculate the actual width and height of the letter's pixels
    const actualWidth = maxX - minX + 1;
    const actualHeight = maxY - minY + 1;

    if (actualWidth <= 0 || actualHeight <= 0) {
        console.warn(`Invalid bounding box dimensions for letter "${letter}". Returning empty texture.`);
        pg1.remove();
        const emptyPg = p.createGraphics(size, size);
        emptyPg.background(0, 0);
        return emptyPg;
    }

    // 3. Create Final Texture Buffer
    let pg3: p5.Graphics;
     try {
        pg3 = p.createGraphics(size, size);
    } catch (e) {
        console.error(`Failed to create final graphics buffer for letter '${letter}':`, e);
        pg1.remove(); // Clean up pg1 if pg3 creation fails
        return null;
    }
    pg3.pixelDensity(1);
    pg3.background(255, 0);

    // 4. Copy and Stretch the cropped letter directly onto the final buffer
    // Source rectangle (from pg1): (minX, minY, actualWidth, actualHeight)
    // Destination rectangle (on pg3): (0, 0, size, size) - stretches to fill
    pg3.image(pg1, 0, 0, size, size, minX, minY, actualWidth, actualHeight);
    
    pg1.remove(); // Clean up the initial buffer

    // No intermediate pg2 needed

    return pg3;
}

/**
 * Generates textures for the uppercase alphabet and digits.
 * @param {p5} p The p5 instance.
 * @param {number} [textureSize=256] The size for each texture.
 * @returns {Record<string, p5.Graphics>} An object mapping characters to their textures.
 */
export function generateAlphabetTextures(p: p5, textureSize: number = 256): Record<string, p5.Graphics> {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const textures: Record<string, p5.Graphics> = {};
    console.log(`Generating character textures (${textureSize}x${textureSize})...`);
    const startTime = p.millis();

    for (const char of chars) {
        const texture = createLetterTexture(p, char, textureSize);
        if (texture) {
            textures[char] = texture;
        } else {
             console.warn(`Skipping texture generation for '${char}' due to error.`);
        }
    }

    const endTime = p.millis();
    console.log(`Character textures generated in ${((endTime - startTime) / 1000).toFixed(2)} seconds.`);
    return textures;
} 