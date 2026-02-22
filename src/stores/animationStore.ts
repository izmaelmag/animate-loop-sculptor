import { create } from "zustand";
import { persist } from "zustand/middleware";
import { animationSettings, defaultAnimation } from "../animations";
import { AnimationSettings, AnimationParams, FrameContext } from "../types/animations";

const getDefaultParamsForAnimation = (id: string): AnimationParams => {
  const settings = animationSettings[id];
  return { ...(settings?.defaultParams || {}) };
};

const getMergedParamsForAnimation = (
  id: string,
  existing?: AnimationParams,
): AnimationParams => {
  return {
    ...getDefaultParamsForAnimation(id),
    ...(existing || {}),
  };
};

interface AnimationStore {
  // Which animation template is selected
  selectedAnimationId: string;
  setSelectedAnimationId: (id: string) => void;

  // Animation parameters per animation id
  animationParamsById: Record<string, AnimationParams>;
  getParamsForAnimation: (id?: string) => AnimationParams;
  setAnimationParams: (
    id: string,
    next: AnimationParams | ((prev: AnimationParams) => AnimationParams),
  ) => void;
  patchAnimationParams: (id: string, patch: Partial<AnimationParams>) => void;
  resetAnimationParams: (id: string) => void;

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
      animationParamsById: {
        [defaultAnimation.id]: getDefaultParamsForAnimation(defaultAnimation.id),
      },
      currentFrame: 0,
      isPlaying: false,

      setSelectedAnimationId: (id: string) => {
        const settings = animationSettings[id];
        if (!settings) return;
        set((state) => ({
          selectedAnimationId: id,
          currentFrame: 0,
          isPlaying: false,
          animationParamsById: state.animationParamsById[id]
            ? state.animationParamsById
            : {
                ...state.animationParamsById,
                [id]: getDefaultParamsForAnimation(id),
              },
        }));
      },

      getParamsForAnimation: (id?: string) => {
        const animationId = id || get().selectedAnimationId;
        const existing = get().animationParamsById[animationId];
        return getMergedParamsForAnimation(animationId, existing);
      },

      setAnimationParams: (id, next) => {
        set((state) => {
          const prev = getMergedParamsForAnimation(id, state.animationParamsById[id]);
          const resolved = typeof next === "function" ? next(prev) : next;
          return {
            animationParamsById: {
              ...state.animationParamsById,
              [id]: getMergedParamsForAnimation(id, resolved),
            },
          };
        });
      },

      patchAnimationParams: (id, patch) => {
        set((state) => {
          const prev = getMergedParamsForAnimation(id, state.animationParamsById[id]);
          return {
            animationParamsById: {
              ...state.animationParamsById,
              [id]: getMergedParamsForAnimation(id, {
                ...prev,
                ...patch,
              }),
            },
          };
        });
      },

      resetAnimationParams: (id) => {
        set((state) => ({
          animationParamsById: {
            ...state.animationParamsById,
            [id]: getDefaultParamsForAnimation(id),
          },
        }));
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
        const { currentFrame, selectedAnimationId } = get();
        const settings = get().getSettings();
        const totalFrames = settings.totalFrames;
        const normalizedTime =
          totalFrames > 1 ? currentFrame / (totalFrames - 1) : 0;
        const params = get().getParamsForAnimation(selectedAnimationId);
        return { normalizedTime, currentFrame, totalFrames, params };
      },
    }),
    {
      name: "animation-storage",
      partialize: (state) => ({
        selectedAnimationId: state.selectedAnimationId,
        animationParamsById: state.animationParamsById,
      }),
    }
  )
);
