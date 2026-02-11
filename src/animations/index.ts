import { AnimationSettings } from "@/types/animations";

import { settings as defaultAnimation } from "./orbital";
import { settings as demoAnimation } from "./demo";

export { settings as defaultAnimation } from "./orbital";
export { settings as demoAnimation } from "./demo";

// All animation settings keyed by ID
export const animationSettings: Record<string, AnimationSettings> = {
  [defaultAnimation.id]: defaultAnimation,
  [demoAnimation.id]: demoAnimation,
};

export type AnimationId = keyof typeof animationSettings;

// List of all available animation IDs
export const animationIds: string[] = Object.keys(animationSettings);
