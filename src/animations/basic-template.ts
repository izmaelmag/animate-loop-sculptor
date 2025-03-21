import { AnimationSettings } from "@/types/animations";

export const settings: AnimationSettings = {
  name: "Basic",
  id: "basic",
  fps: 60,
  totalFrames: 600,
  sequential: false,
  function: animation,
};

/*
 * Basic Animation Template
 *
 * @param {object} p - p5 instance
 * @param {number} t - normalized total time from 0 to 1
 * @param {number} frame - current frame number
 * @param {number} totalFrames - total number of frames in the video
 */
export function animation(p, t, frame, totalFrames) {
  // Clear the canvas to prevent flickering
  p.background(0);

  // Set the P5 pixel ratio to 3
  // Example: Create a pulsing circle with changing colors
  const centerX = p.width / 2;
  const centerY = p.height / 2;

  // Use the exact frame number for precise frame-by-frame animation
  // This ensures the same frame always looks identical, eliminating flickering
  const progress = t;

  // Size oscillation based on frame position
  const minSize = p.width * 0.1;
  const maxSize = p.width * 0.4;
  const size = p.map(p.sin(progress * p.TWO_PI), -1, 1, minSize, maxSize);

  // Color oscillation
  const r = p.map(p.sin(progress * p.TWO_PI), -1, 1, 0, 255);
  const g = p.map(p.sin(progress * p.TWO_PI + p.PI / 3), -1, 1, 0, 255);
  const b = p.map(p.sin(progress * p.TWO_PI + (2 * p.PI) / 3), -1, 1, 0, 255);

  p.noStroke();
  p.fill(r, g, b, 200);

  // Main circle
  p.circle(centerX, centerY, size);

  // Orbiting elements
  const orbitCount = 5;

  for (let i = 0; i < orbitCount; i++) {
    const angle = progress * p.TWO_PI + (i * p.TWO_PI) / orbitCount;
    const orbitDistance = p.width * 0.3;

    const x = centerX + p.cos(angle) * orbitDistance;
    const y = centerY + p.sin(angle) * orbitDistance;

    // Size for orbiting elements
    const orbitSize = p.width * 0.05;

    // Color for orbiting elements (complementary to main circle)
    p.fill(255 - r, 255 - g, 255 - b, 200);
    p.circle(x, y, orbitSize);

    // Connect with lines
    p.stroke(255, 100);
    p.strokeWeight(2);
    p.line(centerX, centerY, x, y);
  }

  // Add frame information
  p.fill(255);
  p.noStroke();
  p.textAlign(p.LEFT, p.TOP);
  p.textSize(16);
  p.text("Frame: " + frame + "/" + (totalFrames - 1), 20, 20);
  p.text("Normalized Time: " + t.toFixed(3), 20, 50);
}
