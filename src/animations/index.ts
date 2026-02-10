import { AnimationSettings } from "@/types/animations";

import { settings as defaultAnimation } from "./orbital";

export { settings as defaultAnimation } from "./orbital";

// All animation settings keyed by ID
export const animationSettings: Record<string, AnimationSettings> = {
  [defaultAnimation.id]: defaultAnimation,
};

export type AnimationId = keyof typeof animationSettings;

// List of all available animation IDs
export const animationIds: string[] = Object.keys(animationSettings);
