import { AnimationSettings } from "../../types/animations";
import { NAME, FPS, TOTAL_FRAMES, WIDTH, HEIGHT } from "./constants";
import { animation, setupAnimation } from "./orbital";

export const settings: AnimationSettings = {
  name: NAME,
  id: "orbital",
  renderer: "p5",
  fps: FPS,
  totalFrames: TOTAL_FRAMES,
  width: WIDTH,
  height: HEIGHT,
  draw: animation,
  setup: setupAnimation,
};
