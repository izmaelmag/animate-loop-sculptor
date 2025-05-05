import { useEffect, useRef, useState } from "react";
import { useAnimation } from "@/contexts";
import PlayerPanels from "./PlayerPanels";

const SketchView = () => {
  const { controller, currentAnimationId } = useAnimation();
  const sketchRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [localFps, setLocalFps] = useState(60);

  useEffect(() => {
    if (!sketchRef.current || !controller) return;

    console.log(`Initializing P5 for animation: ${currentAnimationId}`);
    controller.initializeP5(sketchRef.current);
    setCurrentFrame(controller.currentFrame);
    setLocalFps(controller.fps);

    let unsubscribeFrame: (() => void) | null = null;
    let unsubscribePlayState: (() => void) | null = null;

    if (audioRef.current) {
      unsubscribeFrame = controller.onFrameChanged((frame) => {
        setCurrentFrame(frame);
        if (audioRef.current) {
          const targetTime = frame / localFps;
          if (Math.abs(audioRef.current.currentTime - targetTime) > 0.1) {
            audioRef.current.currentTime = targetTime;
          }
        }
      });

      unsubscribePlayState = controller.onPlayStateChanged((isPlaying) => {
        console.log(`Controller play state changed -> ${isPlaying ? 'playing' : 'pausing'} audio`);
        if (isPlaying) {
          audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
        } else {
          audioRef.current?.pause();
        }
      });

      audioRef.current.currentTime = controller.currentFrame / localFps;
      if (controller.isPlaying) {
        audioRef.current.play().catch(e => console.error("Initial audio play failed:", e));
      } else {
        audioRef.current.pause();
      }

    } else {
      unsubscribeFrame = controller.onFrameChanged((frame) => {
      setCurrentFrame(frame);
    });
    }

    return () => {
      console.log("Cleaning up SketchView listeners and P5 instance...");
      if (unsubscribeFrame) unsubscribeFrame();
      if (unsubscribePlayState) unsubscribePlayState();
      controller.destroy();
    };
  }, [controller, currentAnimationId, audioSrc]);

  if (!controller) {
    return <div>Loading sketch view...</div>;
  }

  return (
    <div className="flex flex-col justify-start items-center h-full p-0 md:p-6 pt-4 md:pt-6 relative gap-0 md:gap-2">
      <audio ref={audioRef} src={audioSrc ?? undefined} preload="auto" />
      
      <div className="mx-auto flex py-4 md:py-4 h-[auto] min-h-[0px] flex-shrink-1 flex-col relative w-full">
        <div
          className="canvas-wrapper aspect-reels w-full flex items-center justify-center relative"
          ref={sketchRef}
        />
      </div>

      <PlayerPanels isPlayable={true} setAudioSrc={setAudioSrc} />
    </div>
  );
};

export default SketchView;
