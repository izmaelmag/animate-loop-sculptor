import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AnimationController,
  createAnimationController,
} from "@/utils/AnimationController";

// Default animation settings
const DEFAULT_DURATION = 10;
const DEFAULT_FPS = 60;

interface AnimationContextType {
  controller: AnimationController | null;
  currentAnimation: string;
  setCurrentAnimation: (name: string) => void;
}

const AnimationContext = createContext<AnimationContextType>({
  controller: null,
  currentAnimation: "basic",
  setCurrentAnimation: () => {},
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
  const [currentAnimation, setCurrentAnimation] = useState<string>("basic");

  useEffect(() => {
    // Create the controller once on mount
    const animationController = createAnimationController(
      DEFAULT_DURATION,
      DEFAULT_FPS
    );

    // Set default animation
    animationController.setAnimation("basic");

    setController(animationController);

    // Clean up on unmount
    return () => {
      animationController.destroy();
    };
  }, []);

  // Update animation when currentAnimation changes
  useEffect(() => {
    if (!controller) return;
    controller.setAnimation(currentAnimation);
  }, [controller, currentAnimation]);

  return (
    <AnimationContext.Provider 
      value={{ 
        controller, 
        currentAnimation,
        setCurrentAnimation
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
};
