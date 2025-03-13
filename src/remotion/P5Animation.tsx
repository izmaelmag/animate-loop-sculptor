
import { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, delayRender, continueRender } from 'remotion';
import p5 from 'p5';

interface P5AnimationProps {
  sketch?: string;
}

export const P5Animation: React.FC<P5AnimationProps> = ({ sketch = '' }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const handleRef = useRef<number | null>(null);
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  
  // Calculate the normalized time based on current frame
  const normalizedTime = frame / Math.max(durationInFrames - 1, 1);
  
  useEffect(() => {
    // Only delay render once
    if (handleRef.current === null) {
      handleRef.current = delayRender("Creating P5 instance");
      console.log("Remotion: Delaying render to create P5 instance");
    }

    // Skip rendering if we're in a Node.js environment for SSR
    if (typeof window === 'undefined') {
      console.log("Remotion: Node environment detected, skipping P5 instantiation");
      if (handleRef.current !== null) {
        continueRender(handleRef.current);
        handleRef.current = null;
      }
      return;
    }
    
    if (!canvasRef.current) {
      console.warn("Remotion: Canvas ref is not available yet");
      return;
    }
    
    // Clean up previous instance
    if (p5InstanceRef.current) {
      console.log("Remotion: Removing existing P5 instance");
      p5InstanceRef.current.remove();
      p5InstanceRef.current = null;
    }
    
    try {
      console.log("Remotion: Creating new P5 instance");
      
      const sketchFn = (p: p5) => {
        p.setup = () => {
          console.log(`Remotion: Setting up P5 canvas: ${width}x${height}`);
          p.createCanvas(width, height);
          p.frameRate(fps);
          p.background(0);
        };
        
        p.draw = () => {
          try {
            p.clear();
            p.background(0);
            
            if (sketch) {
              try {
                // Use Function constructor to create a function that includes this scope's variables
                const safeSketch = new Function(
                  'p', 
                  'normalizedTime', 
                  'frameNumber', 
                  'totalFrames',
                  `
                  // Set up safe fallbacks for variables
                  const frame = frameNumber || 0;
                  const duration = totalFrames || 1;
                  const t = normalizedTime || 0;
                  
                  ${sketch}
                  `
                );
                
                safeSketch(p, normalizedTime, frame, durationInFrames);
              } catch (stringError) {
                console.error('Remotion: Error executing sketch:', stringError);
                p.background(255, 0, 0);
                p.fill(255);
                p.textSize(24);
                p.textAlign(p.CENTER, p.CENTER);
                p.text(`Error: ${stringError.message}`, p.width/2, p.height/2);
              }
            } else {
              // Fallback
              p.background(0);
              p.fill(255);
              p.textSize(32);
              p.textAlign(p.CENTER, p.CENTER);
              p.text('No sketch code provided', p.width/2, p.height/2);
            }
            
            // Frame info for debugging
            p.fill(255);
            p.noStroke();
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(16);
            p.text(`Frame: ${frame}/${durationInFrames-1}`, 20, 20);
            p.text(`Normalized: ${normalizedTime.toFixed(4)}`, 20, 45);
          } catch (error) {
            console.error('Remotion: Error in sketch execution:', error);
            p.background(255, 0, 0);
            p.fill(255);
            p.textSize(24);
            p.textAlign(p.CENTER, p.CENTER);
            p.text(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, p.width/2, p.height/2);
          }
        };
      };
      
      p5InstanceRef.current = new p5(sketchFn, canvasRef.current);
      console.log("Remotion: P5 instance created successfully");
      
      // Continue rendering
      if (handleRef.current !== null) {
        console.log("Remotion: Continuing render after P5 initialization");
        continueRender(handleRef.current);
        handleRef.current = null;
      }
    } catch (error) {
      console.error('Remotion: Error creating P5 instance:', error);
      if (handleRef.current !== null) {
        continueRender(handleRef.current);
        handleRef.current = null;
      }
    }
    
    return () => {
      if (p5InstanceRef.current) {
        console.log("Remotion: Cleanup: removing P5 instance");
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [sketch, frame, durationInFrames, fps, width, height, normalizedTime]);
  
  return (
    <div 
      ref={canvasRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
      }} 
    />
  );
};
