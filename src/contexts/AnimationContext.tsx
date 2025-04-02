import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AnimationController,
  createAnimationController,
} from "@/utils/AnimationController";
import { getAnimationSettingsByName, animationSettings } from "@/animations";
import { useAnimationStore } from "@/stores/animationStore";

// Get default settings from animation
const defaultSettings = getAnimationSettingsByName("lerpMoveIntro");

interface AnimationContextType {
  controller: AnimationController | null;
  currentAnimation: string;
  setCurrentAnimation: (name: string) => void;
}

const AnimationContext = createContext<AnimationContextType>({
  controller: null,
  currentAnimation: "lerpMoveIntro",
  setCurrentAnimation: () => {},
});

interface AnimationProviderProps {
  children: React.ReactNode;
}

export const useAnimation = () => useContext(AnimationContext);

export const AnimationProvider: React.FC<AnimationProviderProps> = ({
  children,
}) => {
  const [controller, setController] = useState<AnimationController | null>(
    null
  );
  const [currentAnimation, setCurrentAnimation] =
    useState<string>("lerpMoveIntro");
  const { selectedAnimation } = useAnimationStore();

  useEffect(() => {
    // Create the controller with default animation settings
    const animationController = createAnimationController(
      defaultSettings.fps,
      defaultSettings.totalFrames,
      defaultSettings.width,
      defaultSettings.height
    );

    // Set the persisted animation
    animationController.setAnimation(selectedAnimation);
    setCurrentAnimation(selectedAnimation);

    setController(animationController);

    // Clean up on unmount
    return () => {
      animationController.destroy();
    };
  }, [selectedAnimation]);

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
