import React, { useEffect, useRef } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import p5 from 'p5';
import { animation as defaultAnimation } from '../animation';

interface P5AnimationProps {
  sketch?: string;
}

export const P5Animation: React.FC<P5AnimationProps> = ({ sketch = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5>();
  const frame = useCurrentFrame();
  const { durationInFrames, fps, width, height } = useVideoConfig();

  useEffect(() => {
    if (!containerRef.current) return;

    // Check if p5 instance already exists
    if (p5Ref.current) {
      p5Ref.current.remove();
    }

    // Calculate animation variables
    const t = frame / durationInFrames;
    const frameNumber = frame;
    const totalFrames = durationInFrames;

    // Create sketch function to pass to p5
    const sketchFunc = (p: p5) => {
      p.setup = () => {
        p.createCanvas(width, height);
      };

      p.draw = () => {
        try {
          if (sketch && sketch.trim().length > 0) {
            // If sketch string is provided, use it
            const sketchFunction = new Function('p', 'frame', 'frameNumber', 'totalFrames', 't', sketch);
            sketchFunction(p, frame, frameNumber, totalFrames, t);
          } else {
            // Otherwise use the imported animation
            defaultAnimation(p, t, frameNumber, totalFrames);
          }
        } catch (error) {
          console.error('Animation error:', error);
          p.background(0);
          p.fill(255, 0, 0);
          p.textSize(20);
          p.text('Animation error: ' + error, 20, 50);
        }
      };
    };

    // Create new p5 instance
    p5Ref.current = new p5(sketchFunc, containerRef.current);

    return () => {
      // Clean up p5 on unmount
      if (p5Ref.current) {
        p5Ref.current.remove();
      }
    };
  }, [frame, sketch, durationInFrames, width, height, fps]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  );
}; 