// WORKING VERSION!!!
// DO NOT TOUCH !!!!
// I AM TELLING THIS TO YOU FOR A REASON!!!
// NO CHANGES SHOULD BE MADE TO THIS FILE
// IF YOU DO, YOU WILL BREAK THE ANIMATION
// AND WE WILL HAVE TO START FROM SCRATCH
// I MEAN IT, DON'T TOUCH IT
// I AM NOT KIDDING
import { useState, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, StepForward, StepBack } from "lucide-react";
import { useAnimation } from "@/contexts";
import Panel from "@/components/ui/panel";

interface TimelineProps {
  isPlayable?: boolean;
}

const Timeline: React.FC<TimelineProps> = ({ isPlayable = true }) => {
  const { controller, currentAnimationId } = useAnimation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [fps, setFps] = useState(0);

  // Initialize state from controller
  useEffect(() => {
    if (!controller) return;

    // Explicitly update all state values from controller when animation changes
    setCurrentFrame(controller.currentFrame);
    setIsPlaying(controller.isPlaying);
    setTotalFrames(controller.totalFrames);
    setFps(controller.fps);

    // Subscribe to frame changes
    const unsubscribeFrame = controller.onFrameChanged(
      (frame, normalizedTime) => {
        setCurrentFrame(frame);
      }
    );

    // Subscribe to play state changes
    const unsubscribePlayState = controller.onPlayStateChanged((playing) => {
      setIsPlaying(playing);
    });

    // Subscribe to settings changes (fps, totalFrames, etc.)
    const unsubscribeSettings = controller.onSettingsChanged(
      (fps, totalFrames) => {
        setFps(fps);
        setTotalFrames(totalFrames);
      }
    );

    return () => {
      unsubscribeFrame();
      unsubscribePlayState();
      unsubscribeSettings();
    };
  }, [controller, currentAnimationId]);

  const handleSliderChange = (value: number[]) => {
    if (!controller) return;

    const newFrame = Math.round(value[0]);
    controller.currentFrame = newFrame;
    controller.redraw();
  };

  const togglePlayback = () => {
    if (!controller) return;
    controller.isPlaying = !controller.isPlaying;
  };

  const resetTimeline = () => {
    if (!controller) return;
    controller.reset();
  };

  if (!controller || totalFrames === 0) {
    return <div>Loading timeline...</div>;
  }

  return (
    <Panel>
      <div className="flex items-end justify-between mb-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isPlaying ? "secondary" : "default"}
            onClick={togglePlayback}
            disabled={!isPlayable}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={resetTimeline}
            disabled={!isPlayable}
          >
            <RotateCcw size={16} />
          </Button>

          {/* Frame Backwards */}
          <Button
            size="sm"
            variant="default"
            onClick={() => {
              if (!controller) return;
              controller.currentFrame -= 1;
              controller.redraw();
            }}
            disabled={isPlaying || !isPlayable || currentFrame === 0}
          >
            <StepBack size={16} />
          </Button>

          {/* Frame Forwards */}
          <Button
            size="sm"
            variant="default"
            onClick={() => {
              if (!controller) return;
              controller.currentFrame += 1;
              controller.redraw();
            }}
            disabled={
              isPlaying || !isPlayable || currentFrame === totalFrames - 1
            }
          >
            <StepForward size={16} />
          </Button>
        </div>
        <div className="text-xs font-mono">
          <span>
            <span className="font-bold">Frame:</span> {currentFrame}/
            {totalFrames - 1}
          </span>

          <span className="ml-2">
            ({(controller.normalizedTime * 100).toFixed(1)}%)
          </span>
        </div>
      </div>

      <Slider
        disabled={!isPlayable}
        value={[currentFrame]}
        min={0}
        step={1}
        max={totalFrames - 1}
        onValueChange={handleSliderChange}
        className="mt-2 mb-6"
      />
    </Panel>
  );
};

export default Timeline;
