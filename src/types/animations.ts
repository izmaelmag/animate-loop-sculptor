import p5 from "p5";

export type AnimationFunction = (
  p: p5,
  normalizedTime: number,
  frameNumber: number,
  totalFrames: number,
  startTime?: number,
  endTime?: number
) => void;

export interface AnimationSettings {
  name: string;
  id: string;
  fps: number;
  totalFrames: number;
  width?: number;
  height?: number;
  function: AnimationFunction;
  preload?: AnimationFunction;
  onSetup?: AnimationFunction;
  onUpdate?: AnimationFunction;
}
