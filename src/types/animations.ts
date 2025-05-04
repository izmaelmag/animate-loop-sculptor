import p5 from "p5";

// Define a more specific type for props
interface AnimationProps {
  noiseSeedPhrase?: string;
  // Allow other properties, but prefer unknown over any for type safety
  [key: string]: unknown; 
}

export type AnimationFunction = (
  p: p5,
  normalizedTime?: number,
  currentFrameNum?: number,
  totalFrames?: number,
  props?: AnimationProps // Use the more specific type
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
