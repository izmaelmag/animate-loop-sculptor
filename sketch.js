// Simple P5.js sketch with animation
// In this code t is normalized time from 0 to 1
// frame is the current frame number
// frameNumber is the same as frame
// totalFrames is the total number of frames in the video

// Set background
p.background(0);

// Calculate center
const centerX = p.width / 2;
const centerY = p.height / 2;

// Set fill color
p.fill(255);
p.noStroke();

// Draw text
p.textSize(50);
p.textAlign(p.CENTER, p.CENTER);
p.text(`Frame ${frameNumber} of ${totalFrames}`, centerX, centerY - 300);

// Animation of circle
const circleSize = p.map(p.sin(t * p.TWO_PI * 2), -1, 1, 100, 300);
p.fill(255, 0, 100);
p.ellipse(centerX, centerY, circleSize, circleSize);

// Animation of rotating points
const numPoints = 12;
const radius = 250;
p.fill(0, 255, 255);

for (let i = 0; i < numPoints; i++) {
  const angle = t * p.TWO_PI + (i / numPoints) * p.TWO_PI;
  const x = centerX + p.cos(angle) * radius;
  const y = centerY + p.sin(angle) * radius;
  const pointSize = p.map(p.sin(t * p.TWO_PI * 3 + i), -1, 1, 20, 50);

  p.ellipse(x, y, pointSize, pointSize);
}

// Draw progress bar
const progressWidth = p.width * 0.8;
const progressHeight = 20;
const progressX = centerX - progressWidth / 2;
const progressY = centerY + 400;

// Background of progress bar
p.fill(50);
p.rect(progressX, progressY, progressWidth, progressHeight, 10);

// Fill progress bar
p.fill(0, 255, 100);
p.rect(progressX, progressY, progressWidth * t, progressHeight, 10);

// Add percentage of completion
p.fill(255);
p.textSize(30);
p.text(`${Math.round(t * 100)}%`, centerX, progressY + 70);
