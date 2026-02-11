import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, StepForward, StepBack, GripVertical } from "lucide-react";
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
    <div className="quicktime-player px-4 py-2">
      <div className="flex items-center gap-3 min-w-[400px]">
        {/* Playback Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={togglePlayback}
            className="rounded-full w-7 h-7 p-0 text-white/80 hover:text-white hover:bg-white/20"
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={reset}
            className="rounded-full w-7 h-7 p-0 text-white/80 hover:text-white hover:bg-white/20"
          >
            <RotateCcw size={13} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCurrentFrame(currentFrame - 1)}
            disabled={isPlaying || currentFrame === 0}
            className="rounded-full w-7 h-7 p-0 text-white/80 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:text-white/30"
          >
            <StepBack size={13} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCurrentFrame(currentFrame + 1)}
            disabled={isPlaying || currentFrame >= maxFrame}
            className="rounded-full w-7 h-7 p-0 text-white/80 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:text-white/30"
          >
            <StepForward size={13} />
          </Button>
        </div>

        {/* Timeline Slider */}
        <div className="flex-1 min-w-[200px]">
          <Slider
            value={[displayCurrentFrame]}
            min={0}
            step={1}
            max={maxFrame}
            onValueChange={handleSliderChange}
            className="cursor-pointer"
          />
        </div>

        {/* Frame Counter */}
        <div className="text-xs font-mono text-white/70 flex-shrink-0 min-w-[60px] text-right">
          {(displayCurrentFrame + 1)
            .toString()
            .padStart(displayTotalFrames.toString().length, "0")}
          <span className="text-white/40"> / </span>
          {displayTotalFrames
            .toString()
            .padStart(displayTotalFrames.toString().length, "0")}
        </div>

        {/* Drag Handle */}
        <div className="drag-handle flex-shrink-0 cursor-move pl-2 border-l border-white/10">
          <GripVertical size={14} className="text-white/40 hover:text-white/60" />
        </div>
      </div>
    </div>
  );
};

export default Timeline;
