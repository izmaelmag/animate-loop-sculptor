import { AnimationSettings } from "@/types/animations";

import { settings as defaultAnimation } from "./default";
import { settings as demo } from "./demo";
import { settings as decksDark } from "./decks-dark/animation";
import { settings as orbital } from "./orbital";

export { settings as defaultAnimation } from "./default";

// All animation settings keyed by ID
export const animationSettings: Record<string, AnimationSettings> = {
  [defaultAnimation.id]: defaultAnimation,
  [demo.id]: demo,
  [decksDark.id]: decksDark,
  [orbital.id]: orbital,
};

export type AnimationId = keyof typeof animationSettings;

// List of all available animation IDs
export const animationIds: string[] = Object.keys(animationSettings);
