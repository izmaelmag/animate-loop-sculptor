import p5 from "p5";
import { AnimationSettings, P5AnimationFunction, FrameContext } from "@/types/animations";

const FPS = 60;
const WIDTH = 1080;
const HEIGHT = 1920;
const DURATION = 2;

const draw: P5AnimationFunction = (p: p5, ctx: FrameContext): void => {
  p.background(0);
  p.textAlign(p.CENTER, p.CENTER);
  p.fill(255);
  p.textSize(100);
  p.text(
    "This is starter file",
    p.width / 2,
    p.height / 2 + 42 * Math.sin(Math.PI * 2 * ctx.normalizedTime)
  );
};

const setup = (p: p5): void => {
  p.background(0);
  p.frameRate(FPS);
};

export const settings: AnimationSettings = {
  id: "default",
  name: "Default",
  renderer: "p5",
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  totalFrames: DURATION * FPS,
  draw,
  setup,
};
