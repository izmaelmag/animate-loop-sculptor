
// Default template with basic animation and normalized time loop
export const defaultSketch = `
// This is a template for a looped animation using P5.js
// The 'normalizedTime' parameter (0-1) represents the position in the animation cycle

// normalizedTime: 0 = start of loop, 1 = end of loop (loops back to 0)
// p: p5 instance

// Clear the canvas
p.background(0);

// Calculate the current progress in the loop
const progress = normalizedTime;

// Example: Create a pulsing circle with changing colors
const centerX = p.width / 2;
const centerY = p.height / 2;

// Size oscillation
const minSize = p.width * 0.1;
const maxSize = p.width * 0.4;
const size = p.map(
  p.sin(progress * p.TWO_PI), 
  -1, 1, 
  minSize, maxSize
);

// Color oscillation
const r = p.map(p.sin(progress * p.TWO_PI), -1, 1, 0, 255);
const g = p.map(p.sin(progress * p.TWO_PI + p.PI/3), -1, 1, 0, 255);
const b = p.map(p.sin(progress * p.TWO_PI + 2*p.PI/3), -1, 1, 0, 255);

p.noStroke();
p.fill(r, g, b, 200);

// Main circle
p.circle(centerX, centerY, size);

// Orbiting elements
const orbitCount = 5;
for (let i = 0; i < orbitCount; i++) {
  const angle = progress * p.TWO_PI + (i * p.TWO_PI / orbitCount);
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

// Add text showing the normalized time
p.fill(255);
p.noStroke();
p.textAlign(p.LEFT, p.TOP);
p.textSize(16);
p.text(\`Normalized Time: \${progress.toFixed(3)}\`, 20, 20);
`;

// Template with GSAP sequenced animation
export const gsapSequenceSketch = `
// This example uses GSAP for animation sequencing
// Note: This doesn't actually load GSAP, it's meant as a pattern example
// for how you would structure GSAP animations in a real project

// Simulate GSAP timeline with P5
// In a real project, you would import and use GSAP properly

// Clear the canvas
p.background(10, 20, 30);

// Set up the scene
const centerX = p.width / 2;
const centerY = p.height / 2;

// Simulate a GSAP timeline with 5 segments
// Each segment represents 20% of the total timeline
const segments = 5;
const segmentDuration = 1 / segments;

// Determine which segment we're in
const currentSegment = Math.floor(normalizedTime * segments);
const segmentProgress = (normalizedTime * segments) % 1;

// Drawing function for shapes
const drawShape = (x, y, size, rotation, color) => {
  p.push();
  p.translate(x, y);
  p.rotate(rotation);
  p.fill(color);
  p.noStroke();
  p.rectMode(p.CENTER);
  p.rect(0, 0, size, size);
  p.pop();
};

// Set up the animation segments (simulating GSAP timeline)
switch (currentSegment) {
  case 0: // First segment: Circle grows
    const size1 = p.map(segmentProgress, 0, 1, 0, p.width * 0.3);
    p.fill(255, 100, 100);
    p.noStroke();
    p.circle(centerX, centerY, size1);
    break;
    
  case 1: // Second segment: Circle transforms into squares
    const squares = 8;
    for (let i = 0; i < squares; i++) {
      const angle = (i / squares) * p.TWO_PI;
      const distance = p.width * 0.2;
      const x = centerX + p.cos(angle) * distance;
      const y = centerY + p.sin(angle) * distance;
      
      // Use segmentProgress to control the animation
      const size = p.width * 0.06 * segmentProgress;
      const rotation = segmentProgress * p.PI;
      const r = 255 - (i * 20);
      const g = 100 + (i * 15);
      const b = 100;
      
      drawShape(x, y, size, rotation, p.color(r, g, b));
    }
    break;
    
  case 2: // Third segment: Squares orbit
    const orbitSquares = 8;
    for (let i = 0; i < orbitSquares; i++) {
      const angle = (i / orbitSquares) * p.TWO_PI + (segmentProgress * p.PI);
      const distance = p.width * 0.2;
      const x = centerX + p.cos(angle) * distance;
      const y = centerY + p.sin(angle) * distance;
      
      const size = p.width * 0.06;
      const rotation = segmentProgress * p.TWO_PI;
      const r = 255 - (i * 20);
      const g = 100 + (i * 15);
      const b = 100;
      
      drawShape(x, y, size, rotation, p.color(r, g, b));
    }
    break;
    
  case 3: // Fourth segment: Squares converge to center
    const convergeSquares = 8;
    for (let i = 0; i < convergeSquares; i++) {
      const angle = (i / convergeSquares) * p.TWO_PI;
      // Move from orbit to center based on segmentProgress
      const distance = p.width * 0.2 * (1 - segmentProgress);
      const x = centerX + p.cos(angle) * distance;
      const y = centerY + p.sin(angle) * distance;
      
      const size = p.width * 0.06;
      const rotation = segmentProgress * p.TWO_PI * 2;
      const r = 255 - (i * 20);
      const g = 100 + (i * 15);
      const b = 100;
      
      drawShape(x, y, size, rotation, p.color(r, g, b));
    }
    break;
    
  case 4: // Fifth segment: Form final pattern
    // Draw a large center square
    const centerSize = p.width * 0.15 * segmentProgress;
    drawShape(centerX, centerY, centerSize, p.PI * segmentProgress, p.color(255, 200, 100));
    
    // Draw surrounding squares
    const finalSquares = 8;
    for (let i = 0; i < finalSquares; i++) {
      const angle = (i / finalSquares) * p.TWO_PI;
      const distance = p.width * 0.15 + (segmentProgress * p.width * 0.05);
      const x = centerX + p.cos(angle) * distance;
      const y = centerY + p.sin(angle) * distance;
      
      const size = p.width * 0.04;
      const rotation = p.PI * segmentProgress;
      
      // Fade in the surrounding squares
      const alpha = segmentProgress * 255;
      const r = 100 + (i * 10);
      const g = 150 - (i * 5);
      const b = 200;
      
      drawShape(x, y, size, rotation, p.color(r, g, b, alpha));
    }
    break;
}

// Add text showing which segment we're in
p.fill(255);
p.noStroke();
p.textAlign(p.LEFT, p.TOP);
p.textSize(16);
p.text(\`Animation Segment: \${currentSegment + 1}/\${segments}\`, 20, 20);
p.text(\`Segment Progress: \${segmentProgress.toFixed(3)}\`, 20, 50);
p.text(\`Normalized Time: \${normalizedTime.toFixed(3)}\`, 20, 80);
`;
