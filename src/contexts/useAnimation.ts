import { useContext } from "react";
import { AnimationContext } from "./AnimationContext";
import { AnimationContextType } from "./types";

export const useAnimation = (): AnimationContextType =>
  useContext(AnimationContext);
