import { AnimationSettings } from "@/types/animations";
import { renderGrid } from "../utils/renderGrid";
import p5 from "p5";

export const settings: AnimationSettings = {
  name: "Grid Orbit",
  id: "gridOrbit",
  duration: 10,
  fps: 60,
  totalFrames: 600,
  width: 1080,
  height: 1920,
  sequential: false,
  function: animation,
  onSetup: setupAnimation,
};

// Store the grid image to avoid re-rendering on each frame
let cachedGridImage: p5.Image | null = null;
let unitSize: number = 0;
const SCALE = 2.5;

/**
 * Setup function that runs once before the animation starts
 */
export function setupAnimation(p: p5, normalizedTime: number, frameNumber: number, totalFrames: number) {
  console.log("Setting up grid-orbit animation");
  console.log(`Setup at frame ${frameNumber}/${totalFrames}, time: ${normalizedTime}`);
  
  // Force pixel density to 1 for exact pixel matching
  p.pixelDensity(1);
  console.log("Forced pixel density to 1 for exact pixel matching");
  
  // Calculate unit size based on scale
  unitSize = p.width / (2 * SCALE);
  console.log("Unit size calculated:", unitSize);
  
  // Render the grid once
  cachedGridImage = renderGrid({
    p,
    scale: SCALE,
    showMain: true,
    showSecondary: true,
    showUnits: true,
    invertY: true,
    invertX: false,
    mainColor: "#ffffff",
    secondaryColor: "#ffffff",
    mainOpacity: 0.5,
    secondaryOpacity: 0.1,
    mainWidth: 2, // Increased line width for better visibility
    secondaryWidth: 2,
    textSize: 32, // Increased text size for better visibility
  });
  
  p.background(0);
}

/*
 * Grid Orbit Animation
 *
 * @param {object} p - p5 instance
 * @param {number} t - normalized total time from 0 to 1
 * @param {number} frame - current frame number
 * @param {number} totalFrames - total number of frames in the video
 */
export function animation(p: p5, t: number, frame: number, totalFrames: number) {
  // Clear the canvas
  p.background(0);

  const centerX = p.width / 2;
  const centerY = p.height / 2;

  // If grid image hasn't been created yet (first frame or after resize), create it
  if (!cachedGridImage) {
    console.log("Creating grid image in animation function");
    setupAnimation(p, t, frame, totalFrames);
  }

  // Draw the cached grid
  if (cachedGridImage) {
    p.image(cachedGridImage, 0, 0, p.width, p.height);
  } else {
    console.error("Grid image is null");
  }

  // If unitSize is not set, calculate it
  if (!unitSize) {
    unitSize = p.width / (2 * SCALE);
  }

  // Draw a circle with radius of 2 units
  p.noFill();
  p.stroke(255, 100, 100);
  p.strokeWeight(4); // Increased stroke weight for better visibility
  p.circle(centerX, centerY, unitSize * 4); // Diameter = 4 units

  // Calculate position of orbiting circle
  const orbitRadius = unitSize * 2; // 2 unit radius
  const orbitSpeed = 2; // Adjust speed of orbit
  const angle = t * p.TWO_PI * orbitSpeed;

  const orbitX = centerX + p.cos(angle) * orbitRadius;
  const orbitY = centerY + p.sin(angle) * orbitRadius;

  // Draw line connecting center to orbiting circle
  p.stroke(100, 200, 255);
  p.strokeWeight(2); // Increased stroke weight for better visibility
  p.line(centerX, centerY, orbitX, orbitY);

  // Draw orbiting circle
  p.fill(100, 200, 255);
  p.noStroke();
  p.circle(orbitX, orbitY, 24); // Increased size for better visibility

  // Add frame information with scaled text
  p.fill(255);
  p.noStroke();
  p.textAlign(p.LEFT, p.TOP);
  p.textSize(32); // Increased text size for better visibility
  p.text("Frame: " + frame + "/" + (totalFrames - 1), 40, 40);
  p.text("Normalized Time: " + t.toFixed(3), 40, 100);
  
  // Debug info
  if (frame === 0) {
    console.log("First frame rendering with dimensions:", p.width, "x", p.height);
    console.log("Pixel density:", p.pixelDensity());
  }
}
