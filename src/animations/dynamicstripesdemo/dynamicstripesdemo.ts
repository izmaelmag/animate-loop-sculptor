import p5 from "p5";
import {
  AnimationSettings,
  P5AnimationFunction,
  FrameContext,
} from "@/types/animations";
import { DynamicSegments } from "@/utils/DynamicSegments";
import { defaultParams, resolveDynamicStripesParams } from "./settings";
import { createDynamicStripesParamsPane } from "./createParamsPane";

const FPS = 60;
const WIDTH = 1080;
const HEIGHT = 1080;
const DURATION_SECONDS = 16;
const POINT_SHIFT_AMPLITUDE = 0.02;
const TOTAL_FRAMES = FPS * DURATION_SECONDS;

const lineA: [number, number] = [WIDTH * 0.2, HEIGHT * 0.2];
const lineB: [number, number] = [WIDTH * 0.8, HEIGHT * 0.8];

const dynamicSegments = new DynamicSegments(lineA, lineB, {
  segmentCount: defaultParams.segmentCount,
  gap: defaultParams.segmentGap,
});

const draw: P5AnimationFunction = (p: p5, ctx: FrameContext): void => {
  const params = resolveDynamicStripesParams(ctx.params);

  p.background(0);
  p.noFill();
  p.strokeWeight(8);
  p.stroke(255);

  // Rebuild to even split and gap each frame before animated offsets.
  dynamicSegments.setSegmentCount(params.segmentCount);
  dynamicSegments.setGap(params.segmentGap);

  const deltas = dynamicSegments.splitPoints.map((_, index) => {
    const phase =
      ctx.normalizedTime * Math.PI * 2 * params.speed +
      index * params.phaseDelta;
    return Math.sin(phase) * POINT_SHIFT_AMPLITUDE;
  });
  dynamicSegments.updateSplitPoints(deltas);

  const drawableSegments = dynamicSegments.getDrawableSegmentsPx();
  for (let index = 0; index < drawableSegments.length; index += 1) {
    const [[x1, y1], [x2, y2]] = drawableSegments[index];
    p.line(x1, y1, x2, y2);
  }
};

const setup = (p: p5): void => {
  p.background(0);
  p.frameRate(FPS);
};

export const settings: AnimationSettings = {
  id: "dynamicstripesdemo",
  name: "🎨 DynamicStripesDemo",
  renderer: "p5",
  fps: FPS,
  totalFrames: TOTAL_FRAMES,
  width: WIDTH,
  height: HEIGHT,
  defaultParams,
  createParamsPane: createDynamicStripesParamsPane,
  draw,
  setup,
};
