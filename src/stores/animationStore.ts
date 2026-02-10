import { create } from "zustand";
import { persist } from "zustand/middleware";
import { animationSettings, defaultAnimation } from "@/animations";
import { AnimationSettings, FrameContext } from "@/types/animations";

interface AnimationStore {
  // Which animation template is selected
  selectedAnimationId: string;
  setSelectedAnimationId: (id: string) => void;

  // Playback state
  currentFrame: number;
  isPlaying: boolean;
  setCurrentFrame: (frame: number) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlayback: () => void;
  reset: () => void;

  // Derived helpers
  getSettings: () => AnimationSettings;
  getFrameContext: () => FrameContext;
}

export const useAnimationStore = create<AnimationStore>()(
  persist(
    (set, get) => ({
      selectedAnimationId: defaultAnimation.id,
      currentFrame: 0,
      isPlaying: false,

      setSelectedAnimationId: (id: string) => {
        const settings = animationSettings[id];
        if (!settings) return;
        set({ selectedAnimationId: id, currentFrame: 0, isPlaying: false });
      },

      setCurrentFrame: (frame: number) => {
        const settings = get().getSettings();
        const clamped = Math.max(0, Math.min(settings.totalFrames - 1, frame));
        set({ currentFrame: clamped });
      },

      setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),

      togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),

      reset: () => set({ currentFrame: 0, isPlaying: false }),

      getSettings: () => {
        const { selectedAnimationId } = get();
        return animationSettings[selectedAnimationId] || defaultAnimation;
      },

      getFrameContext: () => {
        const { currentFrame } = get();
        const settings = get().getSettings();
        const totalFrames = settings.totalFrames;
        const normalizedTime =
          totalFrames > 1 ? currentFrame / (totalFrames - 1) : 0;
        return { normalizedTime, currentFrame, totalFrames };
      },
    }),
    {
      name: "animation-storage",
      partialize: (state) => ({
        selectedAnimationId: state.selectedAnimationId,
      }),
    }
  )
);
