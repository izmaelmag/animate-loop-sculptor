import { AnimationSettings } from "../types/animations";

import { settings as orbitalAnimation } from "./orbital";
import { settings as demoAnimation } from "./demo";
import { settings as glslDemoAnimation } from "./glsl-demo";
import { settings as r3fDemoAnimation } from "./r3f-demo";
import { settings as dynamicstripesdemoAnimation } from "./dynamicstripesdemo";

export { settings as defaultAnimation } from "./orbital";
export { settings as orbitalAnimation } from "./orbital";
export { settings as demoAnimation } from "./demo";
export { settings as glslDemoAnimation } from "./glsl-demo";
export { settings as r3fDemoAnimation } from "./r3f-demo";
export { settings as dynamicstripesdemoAnimation } from "./dynamicstripesdemo";

// All animation settings keyed by ID
export const animationSettings: Record<string, AnimationSettings> = {
  [orbitalAnimation.id]: orbitalAnimation,
  [demoAnimation.id]: demoAnimation,
  [glslDemoAnimation.id]: glslDemoAnimation,
  [r3fDemoAnimation.id]: r3fDemoAnimation,
  [dynamicstripesdemoAnimation.id]: dynamicstripesdemoAnimation,
};

export type AnimationId = keyof typeof animationSettings;

// List of all available animation IDs
export const animationIds: string[] = Object.keys(animationSettings);
