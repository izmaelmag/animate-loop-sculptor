import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_ANIMATION } from "@/contexts";

interface AnimationStore {
  selectedAnimation: string;
  setSelectedAnimation: (animationId: string) => void;
}

export const useAnimationStore = create<AnimationStore>()(
  persist(
    (set) => ({
      selectedAnimation: DEFAULT_ANIMATION,
      setSelectedAnimation: (selectedAnimation) => set({ selectedAnimation }),
    }),
    {
      name: "animation-storage",
    }
  )
);
