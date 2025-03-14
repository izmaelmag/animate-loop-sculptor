/**
 * GSAP-style Sequence Animation
 * 
 * @param {object} p - p5 instance
 * @param {number} t - normalized time from 0 to 1
 * @param {number} frame - current frame number
 * @param {number} totalFrames - total number of frames in the video
 */
export function animation(p, t, frame, totalFrames) {
  // Clear the canvas to prevent flickering
  p.background(10, 20, 30);

  // Set up the scene
  const centerX = p.width / 2;
  const centerY = p.height / 2;

  // Simulate a GSAP timeline with 5 segments
  // Each segment represents 20% of the total frames
  const segments = 5;
  const segmentFrames = Math.floor(totalFrames / segments);

  // Determine which segment we're in based on the frame number
  const currentSegment = Math.min(Math.floor(frame / segmentFrames), segments - 1);
  const segmentProgress = (frame % segmentFrames) / segmentFrames;

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

  // Add frame information
  p.fill(255);
  p.noStroke();
  p.textAlign(p.LEFT, p.TOP);
  p.textSize(16);
  p.text('Segment: ' + (currentSegment + 1) + '/' + segments, 20, 20);
  p.text('Segment Progress: ' + segmentProgress.toFixed(3), 20, 50);
  p.text('Frame: ' + frame + '/' + (totalFrames-1), 20, 80);
} 