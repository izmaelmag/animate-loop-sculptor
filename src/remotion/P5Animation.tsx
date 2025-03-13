
import { useRef, useEffect, useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, delayRender, continueRender } from 'remotion';
import p5 from 'p5';

interface P5AnimationProps {
  sketch?: string;
  normalizedTime?: number;
}

export const P5Animation: React.FC<P5AnimationProps> = ({
  sketch = '', 
  normalizedTime
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const handleRef = useRef<number | null>(null);
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  
  // Calculate the normalized frame (0-1) based on the current frame
  const currentNormalizedFrame = useMemo(() => {
    return normalizedTime ?? (frame / (durationInFrames - 1));
  }, [normalizedTime, frame, durationInFrames]);
  
  // Get exact frame number based on normalized position
  const exactFrame = useMemo(() => {
    return Math.floor(currentNormalizedFrame * (durationInFrames - 1));
  }, [currentNormalizedFrame, durationInFrames]);

  useEffect(() => {
    // Only delay render once
    if (handleRef.current === null) {
      handleRef.current = delayRender("Creating P5 instance");
    }

    // Skip rendering if we're in a Node.js environment (server-side rendering)
    const isNode = typeof window === 'undefined';
    if (isNode) {
      if (handleRef.current !== null) {
        continueRender(handleRef.current);
        handleRef.current = null;
      }
      return;
    }
    
    if (!canvasRef.current) {
      return;
    }
    
    // Clean up previous instance
    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
      p5InstanceRef.current = null;
    }
    
    // Create a new p5 instance
    try {
      const sketchFn = (p: p5) => {
        p.setup = () => {
          p.createCanvas(width, height);
          p.frameRate(fps);
          p.background(0);
        };
        
        p.draw = () => {
          try {
            p.clear();
            p.background(0);
            
            if (sketch) {
              // Execute the sketch code
              const sketchWithFrameInfo = new Function(
                'p', 
                'normalizedTime', 
                'frameNumber', 
                'totalFrames',
                sketch
              );
              
              sketchWithFrameInfo(
                p, 
                currentNormalizedFrame, 
                exactFrame, 
                durationInFrames
              );
            } else {
              // Fallback
              p.background(0);
              p.fill(255);
              p.textSize(32);
              p.textAlign(p.CENTER, p.CENTER);
              p.text('No sketch code provided', p.width/2, p.height/2);
            }
            
            // Frame info
            p.fill(255);
            p.noStroke();
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(16);
            p.text(`Frame: ${exactFrame}/${durationInFrames-1}`, 20, 20);
            p.text(`Normalized: ${currentNormalizedFrame.toFixed(4)}`, 20, 45);
          } catch (error) {
            console.error('Error in sketch execution:', error);
            p.background(255, 0, 0);
            p.fill(255);
            p.textSize(24);
            p.textAlign(p.CENTER, p.CENTER);
            p.text(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, p.width/2, p.height/2);
          }
        };
      };
      
      p5InstanceRef.current = new p5(sketchFn, canvasRef.current);
      
      // Continue rendering
      if (handleRef.current !== null) {
        continueRender(handleRef.current);
        handleRef.current = null;
      }
    } catch (error) {
      console.error('Error creating P5 instance:', error);
      if (handleRef.current !== null) {
        continueRender(handleRef.current);
        handleRef.current = null;
      }
    }
    
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [sketch, currentNormalizedFrame, exactFrame, durationInFrames, fps, width, height]);
  
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
