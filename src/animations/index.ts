import { AnimationFunction, AnimationSettings } from "@/types/animations";

import { settings as defaultAnimation } from "./orbital";

// Export default animation for direct access
export { settings as defaultAnimation } from "./orbital";

// Export all animation functions by id
export const animations: Record<string, AnimationFunction> = {
  [defaultAnimation.id]: defaultAnimation.function,
};

// Export all animation settings by id
export const animationSettings: Record<string, AnimationSettings> = {
  [defaultAnimation.id]: defaultAnimation,
};

export type AnimationName = keyof typeof animations;

// List of all available animation IDs
export const animationNames: AnimationName[] = Object.keys(animations);
