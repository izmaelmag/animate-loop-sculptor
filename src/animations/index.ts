import { AnimationSettings } from "@/types/animations";

import { settings as orbitalAnimation } from "./orbital";
import { settings as demoAnimation } from "./demo";
import { settings as glslDemoAnimation } from "./glsl-demo";
import { settings as glslNebulaAnimation } from "./glsl-nebula";

export { settings as defaultAnimation } from "./orbital";
export { settings as orbitalAnimation } from "./orbital";
export { settings as demoAnimation } from "./demo";
export { settings as glslDemoAnimation } from "./glsl-demo";
export { settings as glslNebulaAnimation } from "./glsl-nebula";

// All animation settings keyed by ID
export const animationSettings: Record<string, AnimationSettings> = {
  [orbitalAnimation.id]: orbitalAnimation,
  [demoAnimation.id]: demoAnimation,
  [glslDemoAnimation.id]: glslDemoAnimation,
  [glslNebulaAnimation.id]: glslNebulaAnimation,
};

export type AnimationId = keyof typeof animationSettings;

// List of all available animation IDs
export const animationIds: string[] = Object.keys(animationSettings);
