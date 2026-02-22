import p5 from "p5";
import { AnimationSettings, P5AnimationFunction, FrameContext } from "../../types/animations";

const FPS = {{fpsLiteral}};
const WIDTH = {{widthLiteral}};
const HEIGHT = {{heightLiteral}};
const DURATION_SECONDS = {{durationSecondsLiteral}};

const draw: P5AnimationFunction = (p: p5, ctx: FrameContext): void => {
  p.background(0);
  p.fill(255);
  p.noStroke();
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(80);
  p.text({{nameLiteral}}, p.width / 2, p.height / 2 + 28 * Math.sin(ctx.normalizedTime * Math.PI * 2));
};

const setup = (p: p5): void => {
  p.background(0);
  p.frameRate(FPS);
};

export const settings: AnimationSettings = {
  id: {{idLiteral}},
  name: {{displayNameLiteral}},
  renderer: "p5",
  fps: FPS,
  totalFrames: FPS * DURATION_SECONDS,
  width: WIDTH,
  height: HEIGHT,
  draw,
  setup,
};
