import { AnimationFunction } from "@/types/animations";
import { settings as basic } from "./basic-template";
import { settings as gsap } from "./gsap-sequence";

// Export individual animations for direct use
export const animations: Record<string, AnimationFunction> = {
  basic: basic.function,
  gsap: gsap.function,
};

export type AnimationName = keyof typeof animations;

export const animationNames: AnimationName[] = Object.keys(animations);

export const getAnimationByName = (name: AnimationName = "basic") => {
  return animations[name] ?? basic.function;
};
