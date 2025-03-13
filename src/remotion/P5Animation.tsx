
import { useRef, useEffect } from 'react';
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
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  // Calculate the normalized time (0-1) based on the current frame
  const currentNormalizedTime = normalizedTime ?? (frame / durationInFrames);
  
  useEffect(() => {
    const delayHandle = delayRender("Creating P5 instance");
    
    if (!canvasRef.current) {
      continueRender(delayHandle);
      return;
    }
    
    // Clean up previous instance if it exists
    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
    }
    
    try {
      // Create a sketch function
      const sketchFn = (p: p5) => {
        // Convert the sketch string to a function
        const sketchWithTime = new Function('p', 'normalizedTime', sketch || '');
        
        p.setup = () => {
          p.createCanvas(1080, 1920);
          p.frameRate(fps);
        };
        
        p.draw = () => {
          // Call the sketch function with the normalized time
          sketchWithTime(p, currentNormalizedTime);
        };
      };
      
      p5InstanceRef.current = new p5(sketchFn, canvasRef.current);
      continueRender(delayHandle);
    } catch (error) {
      console.error('Error creating P5 sketch:', error);
      continueRender(delayHandle);
    }
    
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
      }
    };
  }, [sketch, currentNormalizedTime, fps]);
  
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
