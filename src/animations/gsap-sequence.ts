import { AnimationSettings, AnimationFunction } from "@/types/animations";

export const settings: AnimationSettings = {
  name: "GSAP Sequence",
  id: "gsap-sequence",
  fps: 60,
  totalFrames: 600,
  sequential: true,
  function: animation,
};

const segment1: AnimationFunction = (p, t) => {
  const size1 = p.map(t, 0, 1, 0, p.width * 0.3);
  p.fill(255, 100, 100);
  p.noStroke();
  p.circle(p.width / 2, p.height / 2, size1);
};

const drawShape = (p, x, y, size, rotation, color) => {
  p.push();
  p.translate(x, y);
  p.rotate(rotation);
  p.fill(color);
  p.noStroke();
  p.rectMode(p.CENTER);
  p.rect(0, 0, size, size);
  p.pop();
};

const segment2: AnimationFunction = (p, t) => {
  const squares = 8;

  for (let i = 0; i < squares; i++) {
    const angle = (i / squares) * p.TWO_PI;
    const distance = p.width * 0.2;
    const x = p.width / 2 + p.cos(angle) * distance;
    const y = p.height / 2 + p.sin(angle) * distance;
    const size = p.width * 0.06 * t;
    const rotation = t * p.PI;
    const r = 255 - i * 20;
    const g = 100 + i * 15;
    const b = 100;
    drawShape(p, x, y, size, rotation, p.color(r, g, b));
  }
};

const segment3: AnimationFunction = (p, t) => {
  const orbitSquares = 8;
  for (let i = 0; i < orbitSquares; i++) {
    const angle = (i / orbitSquares) * p.TWO_PI + t * p.PI;
    const distance = p.width * 0.2;
    const x = p.width / 2 + p.cos(angle) * distance;
    const y = p.height / 2 + p.sin(angle) * distance;
    const size = p.width * 0.06;
    const rotation = t * p.TWO_PI;
    const r = 255 - i * 20;
    const g = 100 + i * 15;
    const b = 100;
    drawShape(p, x, y, size, rotation, p.color(r, g, b));
  }
};

const segment4: AnimationFunction = (p, t) => {
  const convergeSquares = 8;
  for (let i = 0; i < convergeSquares; i++) {
    const angle = (i / convergeSquares) * p.TWO_PI;
    const distance = p.width * 0.2 * (1 - t);
    const x = p.width / 2 + p.cos(angle) * distance;
    const y = p.height / 2 + p.sin(angle) * distance;
    const size = p.width * 0.06;
    const rotation = t * p.TWO_PI * 2;
    const r = 255 - i * 20;
    const g = 100 + i * 15;
    const b = 100;
    drawShape(p, x, y, size, rotation, p.color(r, g, b));
  }
};

const segment5: AnimationFunction = (p, t) => {
  const centerSize = p.width * 0.15 * t;
  drawShape(
    p,
    p.width / 2,
    p.height / 2,
    centerSize,
    p.PI * t,
    p.color(255, 200, 100)
  );
  const finalSquares = 8;
  for (let i = 0; i < finalSquares; i++) {
    const angle = (i / finalSquares) * p.TWO_PI;
    const distance = p.width * 0.15 + t * p.width * 0.05;
    const x = p.width / 2 + p.cos(angle) * distance;
    const y = p.height / 2 + p.sin(angle) * distance;
    const size = p.width * 0.04;
    const rotation = p.PI * t;
    const alpha = t * 255;
    const r = 100 + i * 10;
    const g = 150 - i * 5;
    const b = 200;
    drawShape(p, x, y, size, rotation, p.color(r, g, b, alpha));
  }
};

/**
 * GSAP-style Sequence Animation
 *
 * @param {object} p - p5 instance
 * @param {number} t - normalized time from 0 to 1
 * @param {number} frame - current frame number
 * @param {number} totalFrames - total number of frames in the video
 */
export function animation(...params: Parameters<AnimationFunction>) {
  const [p, t, frame, totalFrames] = params;

  // Clear the canvas to prevent flickering
  p.background(10, 20, 30);

  // Simulate a GSAP timeline with 5 segments
  // Each segment represents 20% of the total frames
  const segments = 5;
  const segmentFrames = Math.floor(totalFrames / segments);

  // Determine which segment we're in based on the frame number
  const currentSegment = Math.min(
    Math.floor(frame / segmentFrames),
    segments - 1
  );

  // Calculate the progress of the current segment
  const segmentProgress = (frame % segmentFrames) / segmentFrames;

  // Drawing function for shapes

  // Set up the animation segments (simulating GSAP timeline)
  switch (currentSegment) {
    case 0:
      segment1(...params);
      break;
    case 1:
      segment2(...params);
      break;
    case 2:
      segment3(...params);
      break;
    case 3:
      segment4(...params);
      break;
    case 4:
      segment5(...params);
      break;
  }

  // Add frame information
  p.fill(255);
  p.noStroke();
  p.textAlign(p.LEFT, p.TOP);
  p.textSize(16);
  p.text("Segment: " + (currentSegment + 1) + "/" + segments, 20, 20);
  p.text("Segment Progress: " + segmentProgress.toFixed(3), 20, 50);
  p.text("Frame: " + frame + "/" + (totalFrames - 1), 20, 80);
}
