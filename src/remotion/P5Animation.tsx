
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
  const delayRenderHandleRef = useRef<number | null>(null);
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  // Calculate the normalized time (0-1) based on the current frame
  const currentNormalizedTime = useMemo(() => {
    return normalizedTime ?? (frame / (durationInFrames - 1));
  }, [normalizedTime, frame, durationInFrames]);
  
  // Memoize the sketch function to prevent unnecessary re-evaluations
  const sketchFn = useMemo(() => {
    return (p: p5) => {
      p.setup = () => {
        p.createCanvas(1080, 1920);
        p.frameRate(fps);
        p.background(0); // Initialize with black background
      };
      
      p.draw = () => {
        try {
          if (sketch) {
            // Convert the sketch string to a function
            const sketchWithTime = new Function('p', 'normalizedTime', sketch);
            // Call the sketch function with the normalized time
            sketchWithTime(p, currentNormalizedTime);
          } else {
            // Fallback if no sketch is provided
            p.background(0);
            p.fill(255);
            p.textSize(32);
            p.textAlign(p.CENTER, p.CENTER);
            p.text('No sketch code provided', p.width/2, p.height/2);
          }
        } catch (error) {
          console.error('Error executing P5 sketch:', error);
          p.background(255, 0, 0);
          p.fill(255);
          p.textSize(24);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, p.width/2, p.height/2);
        }
      };
    };
  }, [sketch, currentNormalizedTime, fps]);

  useEffect(() => {
    // Only delay render once on component mount
    if (!delayRenderHandleRef.current) {
      delayRenderHandleRef.current = delayRender("Creating P5 instance");
    }
    
    if (!canvasRef.current) {
      return;
    }
    
    // Only create a new p5 instance when needed
    if (!p5InstanceRef.current) {
      try {
        p5InstanceRef.current = new p5(sketchFn, canvasRef.current);
        
        // Continue render once p5 is set up
        if (delayRenderHandleRef.current !== null) {
          continueRender(delayRenderHandleRef.current);
          delayRenderHandleRef.current = null;
        }
      } catch (error) {
        console.error('Error creating P5 sketch:', error);
        if (delayRenderHandleRef.current !== null) {
          continueRender(delayRenderHandleRef.current);
          delayRenderHandleRef.current = null;
        }
      }
    } else {
      // For existing p5 instance, just redraw with new sketch function
      // This prevents creating multiple p5 instances which causes memory leaks
      p5InstanceRef.current.remove();
      p5InstanceRef.current = new p5(sketchFn, canvasRef.current);
    }
    
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [sketchFn]);
  
  return (
    <div 
      ref={canvasRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'black' 
      }} 
    />
  );
};
