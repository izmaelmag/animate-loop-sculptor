// Returns a P5 Graphics image without a background
import p5, { Graphics } from "p5";

export type Params = {
  p: p5;
  frames: [number, number];
  globalCurrentFrame: number;
  transparent: boolean;
};

export type RenderCallbackParams = {
  graphics: Graphics;
  relativeCurrentFrame: number;
  progress: number;
};

export type RenderCallback = (params: RenderCallbackParams) => void;

export const renderTimelineLayer = (
  params: Params,
  renderCallback: RenderCallback
): Graphics => {
  const { p, frames, globalCurrentFrame, transparent } = params;
  const [startFrame, endFrame] = frames;

  const graphics = p.createGraphics(p.width, p.height);

  if (transparent) {
    graphics.clear();
  }

  if (globalCurrentFrame >= startFrame && globalCurrentFrame <= endFrame) {
    renderCallback({
      graphics,
      relativeCurrentFrame: globalCurrentFrame - startFrame,
      progress: (globalCurrentFrame - startFrame) / (endFrame - startFrame),
    });
  }

  return graphics;
};
