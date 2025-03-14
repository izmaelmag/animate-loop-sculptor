# Animator - Simple P5.js Animation to Video Renderer

This project allows you to easily create videos from P5.js animations without the need for server setup or proxies.

## How to Use

1. **Edit animation** in the visual editor on the frontend

   - All changes are saved in the `src/animation.js` file
   - This file is used both in the frontend and during rendering

2. **Render video**:
   ```bash
   node render-video.cjs
   ```
   - Video is saved in the `output` folder

## Project Structure

- `src/animation.js` - **MAIN FILE** with animation code, used both in frontend and during rendering
- `render-video.cjs` - script for video rendering (run manually)
- `src/remotion/` - Remotion components for rendering

## Video Settings

In the `render-video.cjs` file you can modify the following parameters:

```javascript
const FPS = 60; // Frames per second
const DURATION_IN_SECONDS = 10; // Video duration in seconds
const WIDTH = 1080; // Video width in pixels
const HEIGHT = 1920; // Video height in pixels
const QUALITY = "high"; // Video quality ('high', 'medium', 'low')
```

## Animation

The animation code in the `src/animation.js` file has the following format:

```javascript
export function animation(p, t, frame, totalFrames) {
  // p - P5.js instance
  // t - normalized time from 0 to 1
  // frame - current frame number
  // totalFrames - total number of frames in the video

  // Your P5.js code here
  p.background(0);

  // Circle animation example
  const centerX = p.width / 2;
  const centerY = p.height / 2;
  const size = p.map(p.sin(t * p.TWO_PI), -1, 1, 100, 300);
  p.fill(255, 0, 100);
  p.ellipse(centerX, centerY, size, size);
}
```

## Supported P5.js Functions

- `background(color)`
- `fill(r, g, b)`
- `noStroke()`
- `ellipse(x, y, width, height)`
- `rect(x, y, width, height, radius)`
- `text(text, x, y)`
- `textSize(size)`
- `textAlign(horizontal, vertical)`
- `map(value, start1, stop1, start2, stop2)`
- `sin(angle)`, `cos(angle)`

## Requirements

- Node.js
- Packages from `package.json` (`@remotion/bundler`, `@remotion/renderer`, etc.)
