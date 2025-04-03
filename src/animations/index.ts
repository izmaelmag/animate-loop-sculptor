import { AnimationFunction, AnimationSettings } from "@/types/animations";

import { settings as basic } from "./basic-template";
import { settings as lerpMoveIntro } from "./lerp";
import { settings as demo } from "./demo";
import { settings as decksDark } from "./decks-dark/animation";
import { settings as orbital } from "./orbital";

// Export individual animations for direct use
export const animations: Record<string, AnimationFunction> = {
  basic: basic.function,
  lerpMoveIntro: lerpMoveIntro.function,
  demo: demo.function,
  decksDark: decksDark.function,
  orbital: orbital.function,
};

export const animationSettings: Record<string, AnimationSettings> = {
  basic,
  lerpMoveIntro,
  demo,
  decksDark,
  orbital,
};

export type AnimationName = keyof typeof animations;

export const animationNames: AnimationName[] = Object.keys(animations);

export const getAnimationByName = (name: AnimationName = "basic") => {
  return animations[name] ?? basic.function;
};

export const getAnimationSettingsByName = (name: AnimationName = "basic") => {
  return animationSettings[name] ?? basic;
};
