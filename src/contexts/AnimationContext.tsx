import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AnimationController,
  createAnimationController,
} from "@/utils/AnimationController";
import { getAnimationSettingsByName } from "@/animations";

// Default animation template
const DEFAULT_ANIMATION = "lerpMoveIntro";

// Get default settings from animation
const defaultSettings = getAnimationSettingsByName(DEFAULT_ANIMATION);

interface AnimationContextType {
  controller: AnimationController | null;
  currentAnimation: string;
  setCurrentAnimation: (name: string) => void;
}

const AnimationContext = createContext<AnimationContextType>({
  controller: null,
  currentAnimation: DEFAULT_ANIMATION,
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
  const [currentAnimation, setCurrentAnimation] =
    useState<string>(DEFAULT_ANIMATION);

  useEffect(() => {
    // Create the controller with default animation settings
    const animationController = createAnimationController(
      defaultSettings.fps,
      defaultSettings.totalFrames,
      defaultSettings.width,
      defaultSettings.height
    );

    // Set default animation
    animationController.setAnimation(DEFAULT_ANIMATION);

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
        setCurrentAnimation,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
};
