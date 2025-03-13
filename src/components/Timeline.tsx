
import { useState, useEffect } from 'react';
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
  const [currentTime, setCurrentTime] = useState(0);
  const totalFrames = duration * fps;
  
  // Calculate the normalized time (0-1) based on current time
  const normalizedTime = currentTime / duration;
  
  useEffect(() => {
    let animationFrame: number;
    
    const updateTime = () => {
      setCurrentTime(prevTime => {
        // Loop back to start when reaching the end
        const newTime = prevTime + (1 / fps);
        return newTime >= duration ? 0 : newTime;
      });
      
      animationFrame = requestAnimationFrame(updateTime);
    };
    
    if (isPlaying) {
      animationFrame = requestAnimationFrame(updateTime);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, fps, duration]);
  
  // When time changes, call the onTimeUpdate callback
  useEffect(() => {
    onTimeUpdate(currentTime, normalizedTime);
  }, [currentTime, normalizedTime, onTimeUpdate]);
  
  const handleSliderChange = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
  };
  
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };
  
  const resetTimeline = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * fps);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
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
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        <div className="flex gap-2 text-sm">
          <span>{fps} fps</span>
          <span>{totalFrames} frames</span>
        </div>
      </div>
      
      <Slider
        disabled={!isPlayable}
        value={[currentTime]}
        min={0}
        max={duration}
        step={1 / fps}
        onValueChange={handleSliderChange}
        className="my-2"
      />
      
      <div className="text-xs text-muted-foreground">
        <span>Normalized time: {normalizedTime.toFixed(4)}</span>
      </div>
    </div>
  );
};

export default Timeline;
