
import { Composition } from 'remotion';
import { P5Animation } from './P5Animation';
import '../utils/templates';

// Attempt to import templates with relative paths if alias doesn't work
// This helps with server-side rendering where alias might not be configured
let defaultSketch = '';
try {
  // Try to import with alias first (for development)
  const templates = require('../utils/templates');
  defaultSketch = templates.defaultSketch;
} catch (error) {
  console.warn('Failed to import templates with alias, using fallback');
  // Fallback sketch if imports fail
  defaultSketch = `
    // Simple fallback sketch
    p.background(0);
    p.fill(255);
    p.textSize(32);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('P5.js Animation', p.width/2, p.height/2);
  `;
}

// Video configuration for Instagram Reels (9:16 aspect ratio)
const COMPOSITION_WIDTH = 1080;
const COMPOSITION_HEIGHT = 1920;
const FPS = 60;
const DURATION_IN_SECONDS = 10;
const DURATION_IN_FRAMES = DURATION_IN_SECONDS * FPS;

export const RemotionVideo = () => {
  return (
    <>
      <Composition
        id="P5Animation"
        component={P5Animation}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={COMPOSITION_WIDTH}
        height={COMPOSITION_HEIGHT}
        defaultProps={{
          sketch: defaultSketch,
          normalizedTime: 0,
        }}
      />
    </>
  );
};
