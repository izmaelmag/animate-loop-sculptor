import { AnimationFunction, AnimationSettings } from "@/types/animations";

import { settings as defaultAnimation } from "./default";
import { settings as demo } from "./demo";
import { settings as decksDark } from "./decks-dark/animation";
import { settings as orbital } from "./orbital";

// Export default animation for direct access
export { settings as defaultAnimation } from "./default";

// Export all animation functions by id
export const animations: Record<string, AnimationFunction> = {
  [defaultAnimation.id]: defaultAnimation.function,
  [demo.id]: demo.function,
  [decksDark.id]: decksDark.function,
  [orbital.id]: orbital.function,
};

// Export all animation settings by id
export const animationSettings: Record<string, AnimationSettings> = {
  [defaultAnimation.id]: defaultAnimation,
  [demo.id]: demo,
  [decksDark.id]: decksDark,
  [orbital.id]: orbital,
};

export type AnimationName = keyof typeof animations;

// List of all available animation IDs
export const animationNames: AnimationName[] = Object.keys(animations);
