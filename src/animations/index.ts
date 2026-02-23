import { AnimationSettings } from "../types/animations";

import { settings as orbitalAnimation } from "./orbital";
import { settings as demoAnimation } from "./demo";
import { settings as glslDemoAnimation } from "./glsl-demo";
import { settings as r3fDemoAnimation } from "./r3f-demo";
import { settings as dynamicstripesdemoAnimation } from "./dynamicstripesdemo";
import { settings as dynamicstripesdemo2Animation } from "./dynamicstripesdemo-2";
import { settings as dynamicstripesdemo3Animation } from "./dynamicstripesdemo-3";

export { settings as defaultAnimation } from "./orbital";
export { settings as orbitalAnimation } from "./orbital";
export { settings as demoAnimation } from "./demo";
export { settings as glslDemoAnimation } from "./glsl-demo";
export { settings as r3fDemoAnimation } from "./r3f-demo";
export { settings as dynamicstripesdemoAnimation } from "./dynamicstripesdemo";
export { settings as dynamicstripesdemo2Animation } from "./dynamicstripesdemo-2";
export { settings as dynamicstripesdemo3Animation } from "./dynamicstripesdemo-3";

// All animation settings keyed by ID
export const animationSettings: Record<string, AnimationSettings> = {
  [orbitalAnimation.id]: orbitalAnimation,
  [demoAnimation.id]: demoAnimation,
  [glslDemoAnimation.id]: glslDemoAnimation,
  [r3fDemoAnimation.id]: r3fDemoAnimation,
  [dynamicstripesdemoAnimation.id]: dynamicstripesdemoAnimation,
  [dynamicstripesdemo2Animation.id]: dynamicstripesdemo2Animation,
  [dynamicstripesdemo3Animation.id]: dynamicstripesdemo3Animation,
};

export type AnimationId = keyof typeof animationSettings;

// List of all available animation IDs
export const animationIds: string[] = Object.keys(animationSettings);
