import { AnimationFunction, AnimationSettings } from "@/types/animations";
import { settings as basic } from "./basic-template";
import { lerpMoveIntro } from "./lerp";
import { settings as demo } from "./demo";
import { settings as decksDark } from "./decks-dark/animation";
// import { settings as gsap } from "./gsap-sequence";
// import { settings as gridOrbit } from "./grid-orbit";
// import { settings as multilayered } from "./multilayered";
// import { settings as waitExample } from "./wait-example";

// Export individual animations for direct use
export const animations: Record<string, AnimationFunction> = {
  basic: basic.function,
  // gsap: gsap.function,
  // gridOrbit: gridOrbit.function,
  // multilayered: multilayered.function,
  // waitExample: waitExample.function,
  lerpMoveIntro: lerpMoveIntro.function,
  demo: demo.function,
  decksDark: decksDark.function,
};

export const animationSettings: Record<string, AnimationSettings> = {
  basic,
  // gsap,
  // gridOrbit,
  // multilayered,
  // waitExample,
  lerpMoveIntro,
  demo,
  decksDark,
};

export type AnimationName = keyof typeof animations;

export const animationNames: AnimationName[] = Object.keys(animations);

export const getAnimationByName = (name: AnimationName = "basic") => {
  return animations[name] ?? basic.function;
};

export const getAnimationSettingsByName = (name: AnimationName = "basic") => {
  return animationSettings[name] ?? basic;
};
