import p5 from "p5";

const MIN_STRIP_WIDTH = 256;
const PADDING_X = 24;
const PADDING_Y = 16;

interface TrimBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const findTrimBounds = (
  pg: p5.Graphics,
  requireFullyOpaque: boolean,
): TrimBounds | null => {
  pg.loadPixels();
  if (!pg.pixels || pg.pixels.length === 0) {
    return null;
  }

  const width = pg.width;
  const height = pg.height;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const alpha = pg.pixels[index + 3];
      const isVisible = requireFullyOpaque ? alpha === 255 : alpha > 0;
      if (!isVisible) {
        continue;
      }
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < minX || maxY < minY) {
    return null;
  }

  return { minX, minY, maxX, maxY };
};

export const createTextStripTexture = (
  p: p5,
  text: string,
  color: string,
  thickness: number,
): p5.Graphics => {
  const stripHeight = Math.max(16, Math.ceil(thickness * 2));
  const fontSize = Math.max(12, stripHeight * 0.65);
  const content = text.length > 0 ? text : " ";

  const measure = p.createGraphics(1, 1);
  measure.pixelDensity(1);
  measure.textStyle(p.BOLD);
  measure.textSize(fontSize);
  const measuredWidth = Math.ceil(measure.textWidth(content));
  measure.remove();

  const stripWidth = Math.max(MIN_STRIP_WIDTH, measuredWidth + PADDING_X * 2);
  const sourceWidth = stripWidth + PADDING_X * 2;
  const sourceHeight = stripHeight + PADDING_Y * 2;

  const source = p.createGraphics(sourceWidth, sourceHeight);
  source.pixelDensity(1);
  source.clear();
  source.noStroke();
  source.fill(color);
  source.textAlign(p.CENTER, p.CENTER);
  source.textStyle(p.BOLD);
  source.textSize(fontSize);
  source.text(content, sourceWidth / 2, sourceHeight / 2);

  const bounds =
    findTrimBounds(source, true) ??
    findTrimBounds(source, false) ?? {
      minX: 0,
      minY: 0,
      maxX: sourceWidth - 1,
      maxY: sourceHeight - 1,
    };

  const cropWidth = Math.max(1, bounds.maxX - bounds.minX + 1);
  const cropHeight = Math.max(1, bounds.maxY - bounds.minY + 1);

  const pg = p.createGraphics(stripWidth, stripHeight);
  pg.pixelDensity(1);
  pg.clear();
  pg.image(
    source,
    0,
    0,
    stripWidth,
    stripHeight,
    bounds.minX,
    bounds.minY,
    cropWidth,
    cropHeight,
  );
  source.remove();

  return pg;
};

export const drawTextStripOnSegment = (
  p: p5,
  strip: p5.Graphics,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  thickness: number,
): void => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  if (length <= 1e-6) {
    return;
  }

  const angle = Math.atan2(dy, dx);
  p.push();
  p.translate(x1, y1);
  p.rotate(angle);
  // Stretch one full text strip over the segment rectangle.
  p.image(strip, 0, -thickness / 2, length, thickness, 0, 0, strip.width, strip.height);
  p.pop();
};
