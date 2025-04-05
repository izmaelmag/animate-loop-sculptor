import { animationSettings, defaultAnimation } from "@/animations";

export const DEFAULT_ANIMATION = defaultAnimation.id;
export const DEFAULT_SETTINGS = animationSettings[DEFAULT_ANIMATION] || defaultAnimation;
