import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define the default colors for the initial state
const defaultPaletteColors = [
  "#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00",
  "#FF00FF", "#00FFFF", "#FFA500", "#800080", "#4682B4", "#808080",
];

interface ColorPaletteState {
  colors: string[];
  updateColor: (index: number, newColor: string) => void;
  resetColors: () => void; // Added a reset function
}

export const useColorPaletteStore = create<ColorPaletteState>()(
  persist(
    (set) => ({
      // Initial state
      colors: [...defaultPaletteColors], // Initialize with defaults

      // Action to update a specific color
      updateColor: (index, newColor) =>
        set((state) => {
          if (index < 0 || index >= state.colors.length) {
            console.warn("Invalid index for color update:", index);
            return state; // Return current state if index is invalid
          }
          const newColors = [...state.colors];
          newColors[index] = newColor;
          return { colors: newColors };
        }),

      // Action to reset colors to default
      resetColors: () => set({ colors: [...defaultPaletteColors] }),
    }),
    {
      name: 'color-palette-storage', // Unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // Use localStorage
      partialize: (state) => ({ colors: state.colors }), // Only persist the colors array
      version: 1, // Optional version number for migrations
    }
  )
); 