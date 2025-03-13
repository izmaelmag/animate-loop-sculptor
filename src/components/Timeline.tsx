
import { useState, useEffect, useCallback, useRef } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from '@/lib/utils';

interface TimelineProps {
  duration: number;
  fps: number;
  onTimeUpdate: (time: number, normalizedTime: number) => void;
  isPlayable?: boolean;
}

const Timeline: React.FC<TimelineProps> = ({
  duration,
  fps,
  onTimeUpdate,
  isPlayable = true
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const totalFrames = duration * fps;
  
  // Calculate the normalized time (0-1) based on current frame
  const normalizedTime = totalFrames > 1 ? currentFrame / (totalFrames - 1) : 0;
  
  // Update frame using requestAnimationFrame for smooth playback
  const updateFrame = useCallback((timestamp: number) => {
    if (!lastUpdateTimeRef.current) {
      lastUpdateTimeRef.current = timestamp;
    }
    
    const deltaTime = timestamp - lastUpdateTimeRef.current;
    const frameTime = 1000 / fps; // Time per frame in ms
    
    // Only update if enough time has passed for a frame
    if (deltaTime >= frameTime) {
      setCurrentFrame(prevFrame => {
        // Loop back to start when reaching the end
        const newFrame = prevFrame + 1;
        return newFrame >= totalFrames ? 0 : newFrame;
      });
      
      lastUpdateTimeRef.current = timestamp;
    }
    
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateFrame);
    }
  }, [isPlaying, fps, totalFrames]);
  
  // Start/stop animation loop
  useEffect(() => {
    if (isPlaying) {
      lastUpdateTimeRef.current = 0; // Reset the time reference
      animationFrameRef.current = requestAnimationFrame(updateFrame);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, updateFrame]);
  
  // When frame changes, calculate time and call the onTimeUpdate callback
  useEffect(() => {
    const time = (currentFrame / fps);
    onTimeUpdate(time, normalizedTime);
  }, [currentFrame, normalizedTime, fps, onTimeUpdate]);
  
  const handleSliderChange = (value: number[]) => {
    const newFrame = Math.round(value[0]);
    setCurrentFrame(newFrame);
  };
  
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };
  
  const resetTimeline = () => {
    setIsPlaying(false);
    setCurrentFrame(0);
  };
  
  const formatFrameInfo = (frame: number) => {
    const mins = Math.floor(frame / (fps * 60));
    const secs = Math.floor((frame % (fps * 60)) / fps);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${(frame % fps).toString().padStart(2, '0')}`;
  };
  
  return (
    <div className={cn(
      "p-4 rounded-md glass-panel animate-slide-in",
      "flex flex-col gap-2",
      !isPlayable && "opacity-70 pointer-events-none"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={togglePlayback}
            disabled={!isPlayable}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={resetTimeline}
            disabled={!isPlayable}
          >
            <RotateCcw size={16} />
          </Button>
        </div>
        <div className="text-sm font-mono">
          {formatFrameInfo(currentFrame)} / {formatFrameInfo(totalFrames - 1)}
        </div>
        <div className="flex gap-2 text-sm">
          <span>{fps} fps</span>
          <span>{totalFrames} frames</span>
        </div>
      </div>
      
      <Slider
        disabled={!isPlayable}
        value={[currentFrame]}
        min={0}
        max={totalFrames - 1}
        step={1}
        onValueChange={handleSliderChange}
        className="my-2"
      />
      
      <div className="text-xs text-muted-foreground">
        <span>Frame: {currentFrame}/{totalFrames-1}</span>
        <span className="ml-4">Normalized position: {normalizedTime.toFixed(4)}</span>
      </div>
    </div>
  );
};

export default Timeline;
