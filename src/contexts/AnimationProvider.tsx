import { useState, useEffect } from "react";

import { AnimationController } from "@/utils/AnimationController";
import { useAnimationStore } from "@/stores/animationStore";

import { AnimationContext } from "./AnimationContext";
import { DEFAULT_ANIMATION, DEFAULT_SETTINGS } from "./constants";
import { AnimationProviderProps } from "./types";

export const AnimationProvider = ({ children }: AnimationProviderProps) => {
  const { selectedAnimation, setSelectedAnimation } = useAnimationStore();

  const [controller, setController] = useState<AnimationController>(() => {
    const controller = new AnimationController(DEFAULT_SETTINGS.id);

    controller.setAnimation(DEFAULT_ANIMATION);

    return controller;
  });

  useEffect(() => {
    // Set the persisted animation
    if (controller) {
      console.log(`Animation changed to: ${selectedAnimation}`);
      controller.setAnimation(selectedAnimation);
    }

    // Clean up on unmount
    return () => {
      controller?.destroy();
    };
  }, [controller, selectedAnimation]);

  return (
    <AnimationContext.Provider
      value={{
        controller,
        currentAnimationId: selectedAnimation,
        setCurrentAnimationId: setSelectedAnimation,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
};
