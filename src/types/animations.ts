import p5 from "p5";

export type AnimationFunction = (
  p: p5,
  normalizedTime: number,
  frameNumber: number,
  totalFrames: number
) => void;

export interface AnimationTemplate {
  name: string;
  duration: number;
  fps: number;
  totalFrames: number;
  sequential: boolean;
  function: AnimationFunction;
}

export interface AnimationInstance {
  template: AnimationTemplate;
  currentFrame: number;
  isPlaying: boolean;
  normalizedTime: number;
}
export interface AnimationSettings {
  name: string;
  id: string;
  duration: number;
  fps: number;
  totalFrames: number;
  width?: number;
  height?: number;
  sequential: boolean;
  function: AnimationFunction;
  onSetup?: AnimationFunction;
  onUpdate?: AnimationFunction;
}
