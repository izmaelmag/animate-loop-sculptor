import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, StepForward, StepBack } from "lucide-react";
import { useAnimationStore } from "@/stores/animationStore";
import Panel from "@/components/ui/panel";

const Timeline = () => {
  const currentFrame = useAnimationStore((s) => s.currentFrame);
  const isPlaying = useAnimationStore((s) => s.isPlaying);
  const togglePlayback = useAnimationStore((s) => s.togglePlayback);
  const reset = useAnimationStore((s) => s.reset);
  const setCurrentFrame = useAnimationStore((s) => s.setCurrentFrame);
  const getSettings = useAnimationStore((s) => s.getSettings);
  const getFrameContext = useAnimationStore((s) => s.getFrameContext);

  const settings = getSettings();
  const { normalizedTime } = getFrameContext();
  const { fps, totalFrames } = settings;

  const displayTotalFrames = totalFrames > 0 ? totalFrames : 1;
  const displayCurrentFrame = Math.min(currentFrame, displayTotalFrames - 1);
  const maxFrame = displayTotalFrames > 0 ? displayTotalFrames - 1 : 0;

  const handleSliderChange = (value: number[]) => {
    setCurrentFrame(Math.round(value[0]));
  };

  return (
    <Panel>
      <div className="flex items-end justify-between mb-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isPlaying ? "secondary" : "default"}
            onClick={togglePlayback}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </Button>
          <Button size="sm" variant="default" onClick={reset}>
            <RotateCcw size={16} />
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => setCurrentFrame(currentFrame - 1)}
            disabled={isPlaying || currentFrame === 0}
          >
            <StepBack size={16} />
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => setCurrentFrame(currentFrame + 1)}
            disabled={isPlaying || currentFrame >= maxFrame}
          >
            <StepForward size={16} />
          </Button>
        </div>
        <div className="text-xs font-mono">
          <span>
            Frame:{" "}
            {(displayCurrentFrame + 1)
              .toString()
              .padStart(displayTotalFrames.toString().length, "0")}
            /
            {displayTotalFrames
              .toString()
              .padStart(displayTotalFrames.toString().length, "0")}
          </span>
          <span className="ml-2 text-white/50">
            ({(normalizedTime * 100).toFixed(2).padStart(6, "0")}% at {fps}{" "}
            fps)
          </span>
        </div>
      </div>

      <Slider
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
