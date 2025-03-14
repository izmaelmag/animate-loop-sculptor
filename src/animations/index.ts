import * as basic from "./basic-template";
import * as gsap from "./gsap-sequence";

export type AnimationName = "basic" | "gsap";

// Export individual animations for direct use
export const animations: Record<AnimationName, () => void> = {
  basic: basic.animation,
  gsap: gsap.animation,
};

export const animationNames = Object.keys(animations) as AnimationName[];

export const getAnimationByName = (name: AnimationName = "basic") => {
  return animations[name] ?? basic.animation;
};
