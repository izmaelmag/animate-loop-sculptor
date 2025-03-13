
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
    }

    // Skip rendering if we're in a Node.js environment for SSR
    if (typeof window === 'undefined') {
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
              // Use simple eval for the sketch code with proper scope
              const safeEval = new Function(
                'p', 
                'normalizedTime', 
                'frame', 
                'totalFrames',
                `
                const t = normalizedTime || 0;
                ${sketch}
                `
              );
              
              safeEval(p, normalizedTime, frame, durationInFrames);
            } else {
              // Fallback
              p.background(0);
              p.fill(255);
              p.textSize(32);
              p.textAlign(p.CENTER, p.CENTER);
              p.text('No sketch code provided', p.width/2, p.height/2);
            }
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
      
      // Continue rendering after p5 is initialized
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
