
import { useState, useEffect, useRef } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from '@/lib/utils';
import { useAnimation } from '@/contexts/AnimationContext';

interface TimelineProps {
  onTimeUpdate?: (time: number, normalizedTime: number) => void;
  isPlayable?: boolean;
}

const Timeline: React.FC<TimelineProps> = ({
  onTimeUpdate,
  isPlayable = true
}) => {
  const { controller } = useAnimation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [fps, setFps] = useState(0);
  
  // Initialize state from controller
  useEffect(() => {
    if (!controller) return;
    
    setCurrentFrame(controller.currentFrame);
    setIsPlaying(controller.isPlaying);
    setTotalFrames(controller.totalFrames);
    setFps(controller.fps);
    
    // Subscribe to frame changes
    const unsubscribeFrame = controller.onFrameChanged((frame, normalizedTime) => {
      setCurrentFrame(frame);
      
      // Call external callback if provided
      if (onTimeUpdate) {
        const time = frame / controller.fps;
        onTimeUpdate(time, normalizedTime);
      }
    });
    
    // Subscribe to play state changes
    const unsubscribePlayState = controller.onPlayStateChanged((playing) => {
      setIsPlaying(playing);
    });
    
    return () => {
      unsubscribeFrame();
      unsubscribePlayState();
    };
  }, [controller, onTimeUpdate]);
  
  const handleSliderChange = (value: number[]) => {
    if (!controller) return;
    
    const newFrame = Math.round(value[0]);
    controller.currentFrame = newFrame;
  };
  
  const togglePlayback = () => {
    if (!controller) return;
    controller.isPlaying = !controller.isPlaying;
  };
  
  const resetTimeline = () => {
    if (!controller) return;
    controller.reset();
  };
  
  const formatFrameInfo = (frame: number) => {
    if (!fps) return "00:00:00";
    
    const mins = Math.floor(frame / (fps * 60));
    const secs = Math.floor((frame % (fps * 60)) / fps);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${(frame % fps).toString().padStart(2, '0')}`;
  };
  
  if (!controller || totalFrames === 0) {
    return <div>Loading timeline...</div>;
  }
  
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
        <span className="ml-4">Normalized position: {controller.normalizedTime.toFixed(4)}</span>
      </div>
    </div>
  );
};

export default Timeline;
