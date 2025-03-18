import { AnimationFunction } from "@/types/animations";

export const circleLayerRenderer: AnimationFunction = (...params) => {
  const [p, normalizedTime, frameNumber, totalFrames, startTime, endTime] =
    params;

  const radius = p.map(normalizedTime, 0, 1, 0, 100);
  p.ellipse(p.width / 2, p.height / 2, radius, radius);
};
