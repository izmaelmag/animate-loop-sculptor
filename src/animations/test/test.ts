import p5 from "p5";
import { AnimationSettings, P5AnimationFunction, FrameContext } from "@/types/animations";

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;
const DURATION_SECONDS = 4;

const draw: P5AnimationFunction = (p: p5, ctx: FrameContext): void => {
  p.background(0);
  p.fill(255);
  p.noStroke();
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(80);
  p.text("test", p.width / 2, p.height / 2 + 28 * Math.sin(ctx.normalizedTime * Math.PI * 2));
};

const setup = (p: p5): void => {
  p.background(0);
  p.frameRate(FPS);
};

export const settings: AnimationSettings = {
  id: "test",
  name: "🎨 test",
  renderer: "p5",
  fps: FPS,
  totalFrames: FPS * DURATION_SECONDS,
  width: WIDTH,
  height: HEIGHT,
  draw,
  setup,
};
