
import { Composition } from 'remotion';
import { P5Animation } from './P5Animation';
import { defaultSketch } from '../utils/templates';

// Video configuration for Instagram Reels (9:16 aspect ratio)
const COMPOSITION_WIDTH = 1080;
const COMPOSITION_HEIGHT = 1920;
const FPS = 60;
const DURATION_IN_SECONDS = 10;
const DURATION_IN_FRAMES = DURATION_IN_SECONDS * FPS;

export const RemotionVideo = () => {
  console.log('Remotion: Initializing RemotionVideo');
  
  // Simple fallback sketch if needed
  const fallbackSketch = `
    // Simple fallback sketch
    p.background(0);
    p.fill(255);
    p.textSize(32);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('P5.js Animation', p.width/2, p.height/2);
  `;
  
  // Use default sketch from templates or fallback
  const initialSketch = defaultSketch || fallbackSketch;
  
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
          sketch: initialSketch,
        }}
      />
    </>
  );
};
