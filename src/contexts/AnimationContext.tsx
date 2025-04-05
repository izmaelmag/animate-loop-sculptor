import { createContext } from "react";

import { AnimationContextType } from "./types";
import { DEFAULT_ANIMATION } from "./constants";

export const AnimationContext = createContext<AnimationContextType>({
  controller: null,
  currentAnimationId: DEFAULT_ANIMATION,
  setCurrentAnimationId: () => {},
});
