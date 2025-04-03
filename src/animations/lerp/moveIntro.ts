import p5 from "p5";
import { AnimationSettings, AnimationFunction } from "@/types/animations";
import { Text } from "../../utils/Text";
// Relative path required for remotion node environment
import { renderGrid, GridOptions } from "../../utils/renderGrid";
import { KFManager } from "../../blueprints/KeyframeManager";
import { easeInOutCubic, easeOutElastic } from "../../utils/easing";
import { Line } from "../../utils/Line";
import { Numset } from "../../utils/Numset";

const WIDTH = 1080;
const HEIGHT = 1920;

const SCALE = 3.5;

const CENTER = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
};

// let gridGraphics: p5.Image;
// const UNIT_SIZE = WIDTH / (2 * SCALE);

const introText = new Text({
  text: " ",
  size: 100,
  center: [100, 100],
  color: "white",
});

introText.setEasing(easeInOutCubic);

const numSet = new Numset([0]);

introText.change("1", 0, 30);
introText.change("2", 30, 30);
introText.change("3", 60, 30);
introText.change("4", 90, 30);
introText.change("1", 120, 30);

introText.move([WIDTH - 100, 100], 30, 30);
introText.move([WIDTH - 100, HEIGHT - 100], 60, 30);
introText.move([100, HEIGHT - 100], 90, 30);
introText.move([100, 100], 120, 30);

introText.recolor([255, 0, 0, 255], 30, 30);
introText.recolor([0, 255, 0, 255], 60, 30);
introText.recolor([0, 0, 255, 255], 90, 30);
introText.recolor([255, 255, 255, 255], 120, 30);

// Define the animation function first, before it's referenced
const animation: AnimationFunction = (
  p: p5,
  normalizedTime: number,
  frameNumber: number,
  totalFrames: number
): void => {
  p.background(0);
  introText.step(frameNumber);
  numSet.step(frameNumber);

  introText.draw(p);
};

function setupAnimation(p: p5): void {
  p.background(0);
  p.frameRate(60);
  introText.step(0);
}

// Now declare the settings after animation is defined
export const settings: AnimationSettings = {
  name: "LERP Move Intro",
  id: "lerpMoveIntro",
  fps: 60,
  totalFrames: 150,
  width: 1080,
  height: 1920,
  sequential: false,
  function: animation,
  onSetup: setupAnimation,
};
