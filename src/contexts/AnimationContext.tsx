import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AnimationController,
  createAnimationController,
} from "@/utils/AnimationController";
import { defaultSketch } from "@/utils/templates";

// Default animation settings
const DEFAULT_DURATION = 10;
const DEFAULT_FPS = 60;

interface AnimationContextType {
  controller: AnimationController | null;
}

const AnimationContext = createContext<AnimationContextType>({
  controller: null,
});

export const useAnimation = () => useContext(AnimationContext);

interface AnimationProviderProps {
  children: React.ReactNode;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({
  children,
}) => {
  const [controller, setController] = useState<AnimationController | null>(
    null
  );

  useEffect(() => {
    // Create the controller once on mount
    const animationController = createAnimationController(
      DEFAULT_DURATION,
      DEFAULT_FPS
    );

    // Set default sketch code
    animationController.sketchCode = defaultSketch;

    setController(animationController);

    // Clean up on unmount
    return () => {
      animationController.destroy();
    };
  }, []);

  return (
    <AnimationContext.Provider value={{ controller }}>
      {children}
    </AnimationContext.Provider>
  );
};
