// WORKING VERSION!!!
// DO NOT TOUCH !!!!
// I AM TELLING THIS TO YOU FOR A REASON!!!
// NO CHANGES SHOULD BE MADE TO THIS FILE
// IF YOU DO, YOU WILL BREAK THE ANIMATION
// AND WE WILL HAVE TO START FROM SCRATCH
// I MEAN IT, DON'T TOUCH IT
// I AM NOT KIDDING
import { useState, useEffect, useReducer } from "react";
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
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  
  const [totalFrames, setTotalFrames] = useState(0);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    if (!controller) return;

    setTotalFrames(controller.totalFrames);
    setFps(controller.fps);
    forceUpdate();

    const unsubscribeFrame = controller.onFrameChanged(
      (frame, normalizedTime) => {
        forceUpdate();
      }
    );

    const unsubscribePlayState = controller.onPlayStateChanged((playing) => {
      forceUpdate();
    });

    const unsubscribeSettings = controller.onSettingsChanged(
      (newFps, newTotalFrames) => {
        setFps(newFps);
        setTotalFrames(newTotalFrames);
        forceUpdate();
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
    forceUpdate();
  };

  const togglePlayback = () => {
    if (!controller) return;
    controller.isPlaying = !controller.isPlaying;
  };

  const resetTimeline = () => {
    if (!controller) return;
    controller.reset();
  };

  const handleStepBack = () => {
    if (!controller) return;
    controller.currentFrame -= 1;
    controller.redraw();
  };

  const handleStepForward = () => {
    if (!controller) return;
    controller.currentFrame += 1;
    controller.redraw();
  };

  const currentFrame = controller ? controller.currentFrame : 0;
  const isPlaying = controller ? controller.isPlaying : false;
  const normalizedTime = controller ? controller.normalizedTime : 0;

  if (!controller) {
    return <Panel><div>Loading timeline...</div></Panel>;
  }

  const displayTotalFrames = totalFrames > 0 ? totalFrames : 1;
  const displayCurrentFrame = Math.min(currentFrame, displayTotalFrames - 1);
  const maxFrame = displayTotalFrames > 0 ? displayTotalFrames - 1 : 0;

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

          <Button
            size="sm"
            variant="default"
            onClick={handleStepBack}
            disabled={isPlaying || !isPlayable || currentFrame === 0}
          >
            <StepBack size={16} />
          </Button>

          <Button
            size="sm"
            variant="default"
            onClick={handleStepForward}
            disabled={
              isPlaying || !isPlayable || currentFrame >= maxFrame
            }
          >
            <StepForward size={16} />
          </Button>
        </div>
        <div className="text-xs font-mono">
          <span>
            <span>Frame:</span>{" "}
            {(displayCurrentFrame + 1)
              .toString()
              .padStart(displayTotalFrames.toString().length, "0")}
            /
            {displayTotalFrames
              .toString()
              .padStart(displayTotalFrames.toString().length, "0")}
          </span>

          <span className="ml-2 text-white/50">
            <span>
              ({(normalizedTime * 100).toFixed(2).padStart(6, "0")}%
            </span>
            <span>&nbsp;at {fps} fps)</span>
          </span>
        </div>
      </div>

      <Slider
        disabled={!isPlayable}
        value={[displayCurrentFrame]}
        min={0}
        step={1}
        max={maxFrame}
        onValueChange={handleSliderChange}
        className="mt-2 mb-6"
      />
    </Panel>
  );
};

export default Timeline;
