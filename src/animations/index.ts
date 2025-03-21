import { AnimationFunction, AnimationSettings } from "@/types/animations";
import { settings as basic } from "./basic-template";
import { settings as gsap } from "./gsap-sequence";
import { settings as gridOrbit } from "./grid-orbit";
import { settings as multilayered } from "./multilayered";
import { settings as waitExample } from "./wait-example";
import { lerpMoveIntro } from "./lerp";

// Export individual animations for direct use
export const animations: Record<string, AnimationFunction> = {
  // basic: basic.function,
  // gsap: gsap.function,
  // gridOrbit: gridOrbit.function,
  // multilayered: multilayered.function,
  // waitExample: waitExample.function,
  lerpMoveIntro: lerpMoveIntro.function,
};

export const animationSettings: Record<string, AnimationSettings> = {
  // basic,
  // gsap,
  // gridOrbit,
  // multilayered,
  // waitExample,
  lerpMoveIntro,
};

export type AnimationName = keyof typeof animations;

export const animationNames: AnimationName[] = Object.keys(animations);

export const getAnimationByName = (name: AnimationName = "basic") => {
  return animations[name] ?? basic.function;
};
