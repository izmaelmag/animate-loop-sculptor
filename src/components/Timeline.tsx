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
    <div className="quicktime-player px-6 py-4">
      <div className="flex flex-col gap-3 min-w-[500px]">
        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant={isPlaying ? "secondary" : "default"}
            onClick={togglePlayback}
            className="rounded-full w-10 h-10 p-0"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={reset}
            className="rounded-full w-9 h-9 p-0 hover:bg-white/20"
          >
            <RotateCcw size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCurrentFrame(currentFrame - 1)}
            disabled={isPlaying || currentFrame === 0}
            className="rounded-full w-9 h-9 p-0 hover:bg-white/20 disabled:opacity-30"
          >
            <StepBack size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCurrentFrame(currentFrame + 1)}
            disabled={isPlaying || currentFrame >= maxFrame}
            className="rounded-full w-9 h-9 p-0 hover:bg-white/20 disabled:opacity-30"
          >
            <StepForward size={16} />
          </Button>
        </div>

        {/* Timeline Slider */}
        <Slider
          value={[displayCurrentFrame]}
          min={0}
          step={1}
          max={maxFrame}
          onValueChange={handleSliderChange}
          className="cursor-pointer"
        />

        {/* Frame Info */}
        <div className="text-xs font-mono text-center text-white/70">
          <span>
            {(displayCurrentFrame + 1)
              .toString()
              .padStart(displayTotalFrames.toString().length, "0")}
            {" / "}
            {displayTotalFrames
              .toString()
              .padStart(displayTotalFrames.toString().length, "0")}
          </span>
          <span className="ml-3 text-white/40">
            {(normalizedTime * 100).toFixed(1)}% · {fps} fps
          </span>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
