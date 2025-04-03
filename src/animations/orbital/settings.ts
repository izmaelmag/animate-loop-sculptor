import { AnimationSettings } from "@/types/animations";
import { NAME, FPS, TOTAL_FRAMES, WIDTH, HEIGHT } from "./constants";
import { animation, setupAnimation } from "./orbital";

export const settings: AnimationSettings = {
  name: NAME,
  id: NAME.toLowerCase().replace(/ /g, "-"),
  fps: FPS,
  totalFrames: TOTAL_FRAMES,
  sequential: false,
  width: WIDTH,
  height: HEIGHT,
  function: animation,
  onSetup: setupAnimation,
};
