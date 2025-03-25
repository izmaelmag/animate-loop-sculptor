import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AnimationName } from '@/animations';

interface AnimationStore {
  selectedAnimation: AnimationName;
  setSelectedAnimation: (animation: AnimationName) => void;
}

export const useAnimationStore = create<AnimationStore>()(
  persist(
    (set) => ({
      selectedAnimation: 'decksDark',
      setSelectedAnimation: (animation) => set({ selectedAnimation: animation }),
    }),
    {
      name: 'animation-storage',
    }
  )
); 