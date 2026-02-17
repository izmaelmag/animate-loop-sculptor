import { AnimationSettings } from "@/types/animations";

import { settings as orbitalAnimation } from "./orbital";
import { settings as demoAnimation } from "./demo";
import { settings as glslDemoAnimation } from "./glsl-demo";
import { settings as glslNebulaAnimation } from "./glsl-nebula";
import { settings as r3fDemoAnimation } from "./r3f-demo";
import { settings as testAnimation } from "./test";
import { settings as testr3fAnimation } from "./testr3f";
import { settings as testglslAnimation } from "./testglsl";

export { settings as defaultAnimation } from "./orbital";
export { settings as orbitalAnimation } from "./orbital";
export { settings as demoAnimation } from "./demo";
export { settings as glslDemoAnimation } from "./glsl-demo";
export { settings as glslNebulaAnimation } from "./glsl-nebula";
export { settings as r3fDemoAnimation } from "./r3f-demo";
export { settings as testAnimation } from "./test";
export { settings as testr3fAnimation } from "./testr3f";
export { settings as testglslAnimation } from "./testglsl";

// All animation settings keyed by ID
export const animationSettings: Record<string, AnimationSettings> = {
  [orbitalAnimation.id]: orbitalAnimation,
  [demoAnimation.id]: demoAnimation,
  [glslDemoAnimation.id]: glslDemoAnimation,
  [glslNebulaAnimation.id]: glslNebulaAnimation,
  [r3fDemoAnimation.id]: r3fDemoAnimation,
  [testAnimation.id]: testAnimation,
  [testr3fAnimation.id]: testr3fAnimation,
  [testglslAnimation.id]: testglslAnimation,
};

export type AnimationId = keyof typeof animationSettings;

// List of all available animation IDs
export const animationIds: string[] = Object.keys(animationSettings);
