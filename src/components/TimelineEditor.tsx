import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { toast } from "sonner"; // Import toast from sonner

// Import core types (adjust path if needed)
import {
  AnimationScene,
  CellStyle,
  LayoutCell,
} from "../animations/unstableGrid2/timeline"; // Adjusted path assuming components is one level above animations

// --- NEW: Interface for imported word data ---
interface WordData {
  word: string;
  start: number;
  end: number;
  frame_start: number;
  frame_end: number;
}

// Extended cell type for editor state
interface EditableLayoutCell {
  char: string;
  color?: string; // Direct color for editor simplicity
}

// Scene type used within the editor state
interface EditableScene {
  id: number; // Unique ID for key in React
  startFrame: number;
  durationFrames?: number;
  backgroundColor?: string; // Scene background color
  secondaryColor?: string; // Scene secondary/filler color
  // Layout grid specific to this scene
  layoutGrid: (EditableLayoutCell | null)[][];
  // We'll keep stylePresets, but editing happens via direct cell color for now
  stylePresets: Record<string, CellStyle>;
}

// --- Initial Settings ---
const INITIAL_GRID_COLS = 10; // Increased default size
const INITIAL_GRID_ROWS = 6;
const DEFAULT_BG_COLOR = "#282c34"; // Default grid background
const DEFAULT_SECONDARY_COLOR = "#333"; // Default null cell background
const FPS = 60; // Define FPS for frame calculation

// --- GridDisplay Component ---
interface GridDisplayProps {
  rows: number;
  cols: number;
  layoutGrid: (EditableLayoutCell | null)[][]; // Pass the grid data
  selectedCellCoords: { row: number; col: number } | null;
  onCellClick: (row: number, col: number) => void;
  backgroundColor?: string; // Optional scene background
  secondaryColor?: string; // Optional scene secondary color
}

const GridDisplay: React.FC<GridDisplayProps> = ({
  rows,
  cols,
  layoutGrid,
  selectedCellCoords,
  onCellClick,
  backgroundColor, // Use passed colors
  secondaryColor,
}) => {
  if (rows <= 0 || cols <= 0) {
    return <div className="text-red-500">Invalid grid dimensions</div>;
  }

  const gridBg = backgroundColor || DEFAULT_BG_COLOR;
  const cellSecondaryBg = secondaryColor || DEFAULT_SECONDARY_COLOR;

  // Use Tailwind for cell base styles where possible
  const cellBaseClasses = "border border-gray-600 w-[35px] h-[35px] flex items-center justify-center text-sm text-gray-300 overflow-hidden box-border relative cursor-pointer select-none";

  return (
    <div className="flex flex-col items-center"> {/* Center the grid */}
      <h4 className="text-base mb-2 text-gray-400">
        Click a cell to select/edit ({rows} x {cols})
      </h4>
      <div 
        className="grid border border-gray-500"
        style={{ 
          gridTemplateColumns: `repeat(${cols}, auto)`,
          gridTemplateRows: `repeat(${rows}, auto)`,
          backgroundColor: gridBg,
          maxWidth: 'fit-content', // Keep grid from expanding
        }}
      >
        {Array.from({ length: rows }).flatMap((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const cellData = layoutGrid?.[r]?.[c];
            const isSelected = selectedCellCoords?.row === r && selectedCellCoords?.col === c;
            
            // Determine background color using Tailwind classes if possible, fallback to style
            let bgColorClass = '';
            if (isSelected) {
                bgColorClass = 'bg-blue-700'; // Selection color
            } else if (cellData) {
                 // Keep specific color for cell data if needed, otherwise use default
                 // bgColorClass = 'bg-gray-700'; 
            } else {
                // Use secondary color passed down or default
            }
            
            const cellStyle: React.CSSProperties = {
               // Use inline styles for colors that come from state/props directly
               backgroundColor: isSelected ? '#445588' : (cellData ? (cellData.color ? 'transparent' : '#333') : cellSecondaryBg), // Simplified logic, might need refinement
               color: cellData?.color || (isSelected ? '#fff' : '#ccc'), // Use cell's specific color if set
               fontWeight: cellData ? 'bold' : 'normal',
            };
            
            if (cellData?.color) {
                cellStyle.backgroundColor = 'transparent'; // Let text color show on default bg
            }


            return (
              <div
                key={`${r}-${c}`}
                className={`${cellBaseClasses} ${bgColorClass}`} // Combine base and dynamic bg classes
                style={cellStyle} // Apply dynamic inline styles (text color, specific bg)
                onClick={() => onCellClick(r, c)}
                title={`Cell [${r}, ${c}]`}
              >
                {cellData?.char || ""}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Key for localStorage
const LOCAL_STORAGE_KEY = "timelineEditorState";

// --- Helper: Panel Component Wrapper (Assuming a Panel component exists and adds padding/styling) ---
// If Panel doesn't exist or doesn't add padding, we might need to add p-4 etc. directly
const PanelWrapper: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-md ${className || ''}`}>
    {title && <h3 className="text-lg font-semibold mb-3 text-gray-200">{title}</h3>}
    {children}
  </div>
);

// --- Main Editor Component ---
const TimelineEditor: React.FC = () => {
  // --- State Initialization ---
  const [gridCols, setGridCols] = useState<number>(INITIAL_GRID_COLS);
  const [gridRows, setGridRows] = useState<number>(INITIAL_GRID_ROWS);
  const [scenes, setScenes] = useState<EditableScene[]>([]);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(null);
  const [selectedCellCoords, setSelectedCellCoords] = useState<{ row: number; col: number } | null>(null);
  const [nextSceneId, setNextSceneId] = useState<number>(0);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const wordsJsonInputRef = useRef<HTMLInputElement>(null);
  const [exportJson, setExportJson] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastUsedColor, setLastUsedColor] = useState<string>("#ffffff");
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- Load State from localStorage on Mount ---
  useEffect(() => {
    console.log("Attempting to load state from localStorage...");
    const savedStateString = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedStateString) {
      try {
        const savedState = JSON.parse(savedStateString);
        console.log("Loaded state:", savedState);

        // Restore state (with fallbacks)
        setGridCols(savedState.gridCols ?? INITIAL_GRID_COLS);
        setGridRows(savedState.gridRows ?? INITIAL_GRID_ROWS);
        setScenes(savedState.scenes ?? []);
        setSelectedSceneIndex(savedState.selectedSceneIndex ?? null);

        // Recalculate nextSceneId based on loaded scenes
        const maxId = (savedState.scenes ?? []).reduce(
          (max: number, scene: EditableScene) => Math.max(max, scene.id),
          -1
        );
        setNextSceneId(maxId + 1);
        console.log(`Recalculated nextSceneId: ${maxId + 1}`);
      } catch (error) {
        console.error("Failed to parse saved state from localStorage:", error);
        // Optionally clear corrupted data: localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } else {
      console.log("No saved state found.");
      // If no saved state, ensure nextSceneId starts at 0
      setNextSceneId(0);
    }
    setIsLoaded(true); // Mark loading as complete
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Save State to localStorage on Update ---
  useEffect(() => {
    // Don't save until initial load is complete
    if (!isLoaded) {
      return;
    }
    console.log("State changed, saving to localStorage...");
    const stateToSave = {
      gridCols,
      gridRows,
      scenes,
      selectedSceneIndex,
      // Do not save: nextSceneId (recalculated), exportJson (derived), selectedCellCoords (transient)
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
      console.log("State saved.");
    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
    // Depend on the state variables we want to save
  }, [scenes, gridCols, gridRows, selectedSceneIndex, isLoaded]);

  // Memoize current scene and cell data to avoid unnecessary calculations
  const currentScene = useMemo(() => {
    return selectedSceneIndex !== null ? scenes[selectedSceneIndex] : null;
  }, [scenes, selectedSceneIndex]);

  const selectedCellData = useMemo(() => {
    if (!currentScene || !selectedCellCoords) return null;
    return (
      currentScene.layoutGrid?.[selectedCellCoords.row]?.[
        selectedCellCoords.col
      ] ?? null
    );
  }, [currentScene, selectedCellCoords]);

  // Effect to focus the hidden input when a cell is selected
  useEffect(() => {
    if (selectedCellCoords && hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, [selectedCellCoords]); // Dependency array ensures this runs when selection changes

  // --- Callbacks ---
  const handleGridSizeChange = (dimension: "rows" | "cols", value: string) => {
    const numValue = Math.max(1, parseInt(value, 10) || 1);

    // Calculate the final dimensions *before* updating state
    const finalNewRows = dimension === "rows" ? numValue : gridRows; // Use current gridRows if cols change
    const finalNewCols = dimension === "cols" ? numValue : gridCols; // Use current gridCols if rows change

    // Update the dimension state (this might be async)
    if (dimension === "rows") {
      setGridRows(numValue);
    } else {
      setGridCols(numValue);
    }

    // Resize layoutGrid for ALL existing scenes using the calculated final dimensions
    setScenes((prevScenes) =>
      prevScenes.map((scene) => {
        const oldGrid = scene.layoutGrid;
        const oldRows = oldGrid.length;
        const oldCols = oldGrid[0]?.length || 0;

        // Create a new grid with the final target dimensions
        const newLayoutGrid: (EditableLayoutCell | null)[][] = Array.from(
          { length: finalNewRows }, // Use finalNewRows calculated above
          () => Array(finalNewCols).fill(null) // Use finalNewCols calculated above
        );

        // Copy existing cells within the new bounds
        for (let r = 0; r < Math.min(oldRows, finalNewRows); r++) {
          // Use finalNewRows
          for (let c = 0; c < Math.min(oldCols, finalNewCols); c++) {
            // Use finalNewCols
            newLayoutGrid[r][c] = oldGrid[r]?.[c] ?? null;
          }
        }

        return { ...scene, layoutGrid: newLayoutGrid };
      })
    );

    setSelectedCellCoords(null); // Deselect cell on resize
  };

  const handleAddScene = () => {
    // Create a new layout grid filled with nulls based on CURRENT grid size
    const newLayoutGrid: (EditableLayoutCell | null)[][] = Array.from(
      { length: gridRows },
      () => Array(gridCols).fill(null)
    );

    const newScene: EditableScene = {
      id: nextSceneId,
      startFrame:
        scenes.length > 0
          ? scenes[scenes.length - 1].startFrame +
            (scenes[scenes.length - 1].durationFrames || 60)
          : 0,
      durationFrames: 60,
      layoutGrid: newLayoutGrid,
      stylePresets: {
        filler: { color: DEFAULT_SECONDARY_COLOR },
        default: { color: "#FFFFFF" },
      },
      backgroundColor: DEFAULT_BG_COLOR,
      secondaryColor: DEFAULT_SECONDARY_COLOR,
    };
    const newScenes = [...scenes, newScene];
    setScenes(newScenes);
    setNextSceneId(nextSceneId + 1);
    setSelectedSceneIndex(newScenes.length - 1);
    setSelectedCellCoords(null);
  };

  // --- NEW: Duplicate Scene ---
  const handleDuplicateScene = (indexToDuplicate: number) => {
    if (indexToDuplicate < 0 || indexToDuplicate >= scenes.length) {
      console.error("Invalid index for duplication");
      return;
    }
    const sceneToDuplicate = scenes[indexToDuplicate];

    // Deep copy the scene (simple way for this structure)
    const duplicatedSceneData = JSON.parse(JSON.stringify(sceneToDuplicate));

    const newScene: EditableScene = {
      ...duplicatedSceneData,
      id: nextSceneId, // Assign new unique ID
      // Place it at the end like addScene
      startFrame:
        scenes.length > 0
          ? scenes[scenes.length - 1].startFrame +
            (scenes[scenes.length - 1].durationFrames || 60)
          : 0,
    };

    const newScenes = [...scenes, newScene];
    setScenes(newScenes);
    setNextSceneId(nextSceneId + 1);
    setSelectedSceneIndex(newScenes.length - 1); // Select the new duplicate
    setSelectedCellCoords(null);
  };

  // --- NEW: Delete Scene ---
  const handleDeleteScene = (indexToDelete: number) => {
    if (indexToDelete < 0 || indexToDelete >= scenes.length) {
      console.error("Invalid index for deletion");
      return;
    }

    const sceneToDelete = scenes[indexToDelete];
    if (
      window.confirm(
        `Are you sure you want to delete Scene ${indexToDelete} (ID: ${sceneToDelete.id})?`
      )
    ) {
      const newScenes = scenes.filter((_, index) => index !== indexToDelete);
      setScenes(newScenes);

      // Adjust selected index
      if (selectedSceneIndex === indexToDelete) {
        // If deleted scene was selected, select previous or null
        setSelectedSceneIndex(
          indexToDelete > 0
            ? indexToDelete - 1
            : newScenes.length > 0
            ? 0
            : null
        );
      } else if (
        selectedSceneIndex !== null &&
        selectedSceneIndex > indexToDelete
      ) {
        // If a later scene was selected, decrement its index
        setSelectedSceneIndex(selectedSceneIndex - 1);
      }
      // If an earlier or no scene was selected, index remains the same (or null)
      setSelectedCellCoords(null); // Deselect cell after deletion
    }
  };

  const handleSelectScene = (index: number) => {
    setSelectedSceneIndex(index);
    setSelectedCellCoords(null); // Deselect cell when changing scenes
  };

  const handleCellClick = (row: number, col: number) => {
    // Toggle selection or select new cell
    if (selectedCellCoords?.row === row && selectedCellCoords?.col === col) {
      setSelectedCellCoords(null);
    } else {
      setSelectedCellCoords({ row, col });
    }
  };

  // --- Cell Editing ---
  const handleCellCharacterInput = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    console.log("[Input KeyDown] Key:", event.key); // Log the pressed key
    if (!currentScene || !selectedCellCoords) {
      console.log(
        "[Input KeyDown] Aborted: No current scene or cell selected."
      );
      return;
    }

    let newChar = "";
    let advanceFocus = false;
    if (event.key.length === 1) {
      newChar = event.key;
      advanceFocus = true; // Advance focus only on character input
    } else if (event.key === "Backspace" || event.key === "Delete") {
      newChar = ""; // Clear character
    } else {
      console.log("[Input KeyDown] Key ignored:", event.key);
      event.preventDefault();
      return;
    }
    event.preventDefault();

    console.log(
      `[Input KeyDown] Calling handleCellChange for [${selectedCellCoords.row}, ${selectedCellCoords.col}] with char: '${newChar}'`
    );
    // Call handleCellChange - note: state updates might be async
    handleCellChange(selectedCellCoords.row, selectedCellCoords.col, {
      char: newChar,
    });

    // Advance focus if a character was entered
    if (advanceFocus) {
      const currentRow = selectedCellCoords.row;
      const currentCol = selectedCellCoords.col;
      const nextCol = currentCol + 1;

      // Check if next column is within grid bounds
      if (nextCol < gridCols) {
        console.log(
          `[Input KeyDown] Advancing focus to [${currentRow}, ${nextCol}]`
        );
        setSelectedCellCoords({ row: currentRow, col: nextCol });
      } else {
        console.log(
          `[Input KeyDown] Reached end of row ${currentRow}, focus not advanced.`
        );
        // Optional: deselect or move to next row?
        // For simplicity, just stop advancing for now.
      }
    }
  };

  // General purpose function to update parts of a cell's data immutably
  const handleCellChange = useCallback(
    (row: number, col: number, updates: Partial<EditableLayoutCell>) => {
      console.log(
        `[handleCellChange] Updating cell [${row}, ${col}] with:`,
        updates
      ); // Log updates
      if (selectedSceneIndex === null) return;

      setScenes((prevScenes) => {
        const newScenes = [...prevScenes];
        const sceneToUpdate = { ...newScenes[selectedSceneIndex] };
        const newLayoutGrid = sceneToUpdate.layoutGrid.map((r) => [...r]);
        const currentCell = newLayoutGrid[row]?.[col];

        if (updates.char === "" && Object.keys(updates).length === 1) {
          console.log(`[handleCellChange] Clearing cell [${row}, ${col}]`);
          newLayoutGrid[row][col] = null;
        } else {
          const existingData = currentCell || { char: "" };

          // Start with existing data and apply updates
          const newCellData: EditableLayoutCell = {
            ...existingData,
            ...updates,
          };

          // Apply last used color if a character is being set/changed,
          // no explicit color is in this update, and a last color exists.
          if (updates.char && updates.color === undefined && lastUsedColor) {
            newCellData.color = lastUsedColor;
          }

          // Keep logic to remove undefined/empty props or invalid states
          if (newCellData.color === "") delete newCellData.color;

          // Ensure char is not literally empty string if cell should exist (e.g., only color was set)
          if (newCellData.char === "" && newCellData.color) {
            newCellData.char = existingData.char || " "; // Use previous char or space if only color exists
          }
          console.log(
            `[handleCellChange] Setting cell [${row}, ${col}] to:`,
            newCellData
          );
          newLayoutGrid[row][col] = newCellData;
        }

        sceneToUpdate.layoutGrid = newLayoutGrid;
        newScenes[selectedSceneIndex] = sceneToUpdate;
        return newScenes;
      });
    },
    [selectedSceneIndex, lastUsedColor] // Add lastUsedColor as dependency
  );

  // Update color for selected cell AND store it as last used color
  const handleSelectedCellColorChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (selectedCellCoords) {
      const newColor = event.target.value;
      handleCellChange(selectedCellCoords.row, selectedCellCoords.col, {
        color: newColor,
      });
      setLastUsedColor(newColor); // Remember this color
    }
  };

  // --- Scene Parameter Editing ---
  const handleSceneParamChange = (
    param: "startFrame" | "durationFrames", // Limit param type
    value: string | number
  ) => {
    if (selectedSceneIndex === null) return;

    const currentSceneIndex = selectedSceneIndex; // Capture index before state update

    setScenes((prevScenes) => {
      let numericValue: number | undefined;
      if (param === "startFrame" || param === "durationFrames") {
        numericValue = typeof value === "string" ? parseInt(value, 10) : value;
        if (isNaN(numericValue)) {
          if (param === "durationFrames" && value === "") {
            numericValue = undefined; // Allow clearing duration
          } else {
            return prevScenes; // Invalid number, do nothing
          }
        } else {
          numericValue = Math.max(0, numericValue); // Ensure non-negative
          if (param === "durationFrames" && numericValue === 0)
            numericValue = 1; // Min duration 1 if set
        }
      }

      // Create a new array for modifications
      const updatedScenes = [...prevScenes];
      const sceneToUpdate = { ...updatedScenes[currentSceneIndex] };

      // Update the target scene
      if (param === "startFrame") {
        sceneToUpdate.startFrame = numericValue as number;
      } else if (param === "durationFrames") {
        sceneToUpdate.durationFrames = numericValue; // Can be undefined
      }
      updatedScenes[currentSceneIndex] = sceneToUpdate;

      // --- Adjust subsequent scene timings ---
      let previousEndFrame =
        sceneToUpdate.startFrame + (sceneToUpdate.durationFrames || 1); // Use 1 if duration undefined for calc

      for (let i = currentSceneIndex + 1; i < updatedScenes.length; i++) {
        const currentStart = updatedScenes[i].startFrame;
        const currentDuration = updatedScenes[i].durationFrames;

        if (currentStart !== previousEndFrame) {
          console.log(
            `Adjusting Scene ${i} startFrame from ${currentStart} to ${previousEndFrame}`
          );
          updatedScenes[i] = {
            ...updatedScenes[i],
            startFrame: previousEndFrame,
          };
        }
        // Update previousEndFrame for the *next* iteration
        previousEndFrame = updatedScenes[i].startFrame + (currentDuration || 1);
      }

      return updatedScenes;
    });
  };

  // Handle color changes
  const handleSceneColorChange = (
    param: "backgroundColor" | "secondaryColor",
    value: string
  ) => {
    if (selectedSceneIndex === null) return;

    const effectiveValue = value === "" ? undefined : value; // Handle empty string case once

    setScenes((prevScenes) => {
      if (selectedSceneIndex === 0) {
        // Apply to ALL scenes if changing the first scene
        console.log(
          `Applying ${param}=${effectiveValue} to ALL scenes because Scene 0 was changed.`
        );
        return prevScenes.map((scene) => ({
          ...scene,
          [param]: effectiveValue,
        }));
      } else {
        // Apply only to the selected scene if it's not the first one
        console.log(
          `Applying ${param}=${effectiveValue} to Scene ${selectedSceneIndex} only.`
        );
        return prevScenes.map((scene, index) => {
          if (index === selectedSceneIndex) {
            return { ...scene, [param]: effectiveValue };
          }
          return scene;
        });
      }
    });
  };

  // --- NEW: Copy Grid Logic ---
  const handleCopyGridFromPrevious = () => {
    if (selectedSceneIndex === null || selectedSceneIndex === 0) {
      alert(
        "Cannot copy from previous: No previous scene exists or no scene selected."
      );
      return;
    }
    const prevSceneIndex = selectedSceneIndex - 1;
    const currentSceneIndex = selectedSceneIndex;

    setScenes((prevScenes) => {
      const gridToCopy = prevScenes[prevSceneIndex]?.layoutGrid;
      if (!gridToCopy) {
        console.error("Previous scene grid data missing?");
        return prevScenes; // Should not happen, but safeguard
      }
      // Deep copy the grid to avoid reference issues
      const copiedGrid = JSON.parse(JSON.stringify(gridToCopy));

      return prevScenes.map((scene, index) => {
        if (index === currentSceneIndex) {
          console.log(
            `Copying grid from Scene ${prevSceneIndex} to Scene ${currentSceneIndex}`
          );
          return { ...scene, layoutGrid: copiedGrid };
        }
        return scene;
      });
    });
  };

  // --- NEW: Words JSON Import Callback ---
  const handleImportWordsJson = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result;
      if (typeof text !== 'string') {
        toast.error("Error reading file content.");
        return;
      }
      try {
        const wordsData: WordData[] = JSON.parse(text);
        if (
          !Array.isArray(wordsData) ||
          wordsData.some(
            (w) =>
              typeof w.word !== "string" ||
              typeof w.frame_start !== "number" ||
              typeof w.frame_end !== "number"
          )
        ) {
          throw new Error(
            "Invalid JSON structure. Expected array of {word, frame_start, frame_end}."
          );
        }
        let currentId = 0;
        const newScenes: EditableScene[] = wordsData.map((wordData) => {
          const duration = Math.max(1, wordData.frame_end - wordData.frame_start); 
          const word = wordData.word.trim();
          const characters = word.split("");
          const newLayoutGrid: (EditableLayoutCell | null)[][] = Array.from({ length: gridRows }, () => Array(gridCols).fill(null));
          const middleRow = Math.floor(gridRows / 2);
          const startCol = Math.max(0, Math.floor((gridCols - characters.length) / 2));
          if (middleRow < gridRows) {
              for (let i = 0; i < characters.length; i++) {
                  const currentCol = startCol + i;
                  if (currentCol < gridCols) {
                      newLayoutGrid[middleRow][currentCol] = { char: characters[i], color: "#FFFFFF" };
                  }
              }
          }
          const newScene: EditableScene = {
              id: currentId++, startFrame: wordData.frame_start, durationFrames: duration, layoutGrid: newLayoutGrid,
              stylePresets: { filler: { color: DEFAULT_SECONDARY_COLOR }, default: { color: "#FFFFFF" }, },
              backgroundColor: DEFAULT_BG_COLOR, secondaryColor: DEFAULT_SECONDARY_COLOR,
          };
          return newScene;
      });
      setScenes(newScenes);
      setNextSceneId(currentId); 
      setSelectedSceneIndex(newScenes.length > 0 ? 0 : null); 
      setSelectedCellCoords(null); 
      toast.success(
        `Successfully imported ${newScenes.length} scenes from words.json!`
      );
    } catch (error) {
      console.error("Failed to parse or process words JSON:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Error importing words JSON", { description: message });
    }
  };
  reader.onerror = () => {
     toast.error("Error reading file.");
  };
  reader.readAsText(file);
  event.target.value = "";
}, [gridRows, gridCols, setScenes, setNextSceneId, setSelectedSceneIndex, setSelectedCellCoords]);

  // --- Export Logic ---
  const convertEditableToAnimationScenes = (
    editableScenes: EditableScene[]
  ): AnimationScene[] => {
    return editableScenes.map((scene) => {
      // Keep only necessary presets (like 'filler')?
      // Or just pass them all through? Let's pass them for now.
      const sceneStylePresets = { ...scene.stylePresets };

      const newLayoutGrid: (LayoutCell | null)[][] = scene.layoutGrid.map(
        (row) =>
          row.map((cell) => {
            if (!cell) return null;

            // Construct the LayoutCell in the new format
            const layoutCell: LayoutCell = {
              char: cell.char,
            };

            // Add style property only if a custom color exists
            if (cell.color) {
              layoutCell.style = { color: cell.color };
            }
            // No need for styleId or modifying presets here anymore

            return layoutCell;
          })
      );

      // Construct the AnimationScene
      const animationScene: AnimationScene = {
        startFrame: scene.startFrame,
        layoutGrid: newLayoutGrid,
        stylePresets: sceneStylePresets, // Pass original/cloned presets
        ...(scene.backgroundColor && {
          backgroundColor: scene.backgroundColor,
        }),
        ...(scene.secondaryColor && { secondaryColor: scene.secondaryColor }),
      };
      if (scene.durationFrames !== undefined) {
        animationScene.durationFrames = scene.durationFrames;
      }

      return animationScene;
    });
  };

  const handleGenerateExport = useCallback(() => {
    setExportJson("Generating..."); 
    setTimeout(() => {
        try {
            const animationScenes = convertEditableToAnimationScenes(scenes);
            const jsonString = JSON.stringify(animationScenes, null, 2);
            setExportJson(jsonString);
        } catch (error) {
            console.error("Error generating export JSON:", error);
            // Fix the linter error by checking if error is an instance of Error
            const message = error instanceof Error ? error.message : "Unknown error";
            setExportJson(`Error generating JSON: ${message}. Check console.`);
            toast.error("Error generating JSON", { description: message });
        }
    }, 10); 
  }, [scenes, convertEditableToAnimationScenes]); // Dependencies for handleGenerateExport

  // --- NEW: Handle Copy JSON ---
  const handleCopyJson = useCallback(() => {
    if (!exportJson || exportJson === "Generating..." || exportJson.startsWith("Error")) {
      toast.error("Cannot copy", { description: "No valid JSON generated yet." });
      return;
    }
    navigator.clipboard.writeText(exportJson)
      .then(() => {
        toast.success("JSON copied to clipboard!");
      })
      .catch(err => {
        console.error("Failed to copy JSON: ", err);
        toast.error("Copy failed", { description: "Could not copy JSON to clipboard." });
      });
  }, [exportJson]); // Dependency: exportJson

  // --- NEW: Audio Callbacks ---
  const handleAudioFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioSrc(url);
      setCurrentFrame(0); // Reset frame count on new file
      // Clean up previous Blob URL if exists?
      // If using multiple files, consider revoking old URLs
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const frame = Math.floor(audioRef.current.currentTime * FPS);
      setCurrentFrame(frame);
    }
  };

  // --- NEW: Main Layout Structure ---
  return (
    <div className="flex h-screen bg-gray-900 text-gray-300">
      
      {/* Left Sidebar */}
      <aside className="w-80 flex-shrink-0 bg-gray-850 p-4 overflow-y-auto flex flex-col gap-4 border-r border-gray-700">
        
        {/* Global Grid Settings */}
        <PanelWrapper title="Global Grid">
          <div className="flex flex-col gap-2">
            <label className="text-sm">
              Columns:
              <input
                type="number"
                min="1"
                value={gridCols}
                onChange={(e) => handleGridSizeChange("cols", e.target.value)}
                className="ml-2 w-16 p-1 rounded bg-gray-700 border border-gray-600 text-gray-200"
              />
            </label>
            <label className="text-sm">
              Rows:
              <input
                type="number"
                min="1"
                value={gridRows}
                onChange={(e) => handleGridSizeChange("rows", e.target.value)}
                 className="ml-2 w-16 p-1 rounded bg-gray-700 border border-gray-600 text-gray-200"
              />
            </label>
          </div>
        </PanelWrapper>

        {/* Scenes List */}
        <PanelWrapper title="Scenes" className="flex-grow flex flex-col min-h-0"> {/* Allow shrinking and scrolling */}
           <div className="flex gap-2 mb-3">
             <button onClick={handleAddScene} className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded">
               + Add Scene
             </button>
             <input
                ref={wordsJsonInputRef}
                type="file"
                accept=".json"
                onChange={handleImportWordsJson}
                className="hidden"
             />
             <button onClick={() => wordsJsonInputRef.current?.click()} className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 rounded">
                Import Words JSON
            </button>
           </div>
           <div className="overflow-y-auto flex-grow pr-1"> {/* Inner scroll for scene list */}
            {scenes.map((scene, index) => (
              <div
                key={scene.id}
                onClick={() => handleSelectScene(index)}
                className={`p-2 mb-2 rounded border cursor-pointer ${
                  selectedSceneIndex === index
                    ? "bg-blue-800 border-blue-600"
                    : "bg-gray-700 border-gray-600 hover:bg-gray-650"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                      Scene {index} (Start: {scene.startFrame}) | Dur: {scene.durationFrames ?? 'N/A'}
                  </span>
                  <div className="flex gap-1">
                     <button
                        onClick={(e) => { e.stopPropagation(); handleDuplicateScene(index); }}
                        className="px-1 py-0.5 text-xs bg-yellow-600 hover:bg-yellow-700 rounded"
                        title="Duplicate Scene"
                     > Dup </button>
                     <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteScene(index); }}
                        className="px-1 py-0.5 text-xs bg-red-600 hover:bg-red-700 rounded"
                        title="Delete Scene"
                      > Del </button>
                  </div>
                </div>
              </div>
            ))}
            {scenes.length === 0 && <p className="text-sm text-gray-500">No scenes yet.</p>}
          </div>
        </PanelWrapper>

        {/* Export Timeline */}
        <PanelWrapper title="Export Timeline" className="flex-shrink-0">
           <div className="flex gap-2 mb-2"> {/* Container for buttons */}
             <button 
               onClick={handleGenerateExport} 
               className="flex-1 px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 rounded"
             >
               Generate Export JSON
             </button>
             <button 
                onClick={handleCopyJson} 
                className="flex-1 px-3 py-1 text-sm bg-teal-600 hover:bg-teal-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!exportJson || exportJson === "Generating..." || exportJson.startsWith("Error")} // Disable if no valid JSON
             >
                Copy JSON
             </button>
           </div>
           {exportJson && (
            <textarea
              readOnly
              value={exportJson}
              // Increased height and added font-mono
              className="w-full h-64 p-2 text-xs rounded bg-gray-900 border border-gray-600 text-gray-200 font-mono"
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
          )}
        </PanelWrapper>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 flex flex-col gap-4 overflow-hidden"> {/* Prevent main area from scrolling internally unless needed */}
          
          {/* Top Row: Settings */}
          <div className="flex gap-4 flex-shrink-0"> {/* Prevent settings row from growing */}
             {/* Scene Settings */}
             <PanelWrapper title="Scene Settings" className="flex-1">
               {currentScene ? (
                  <div className="flex flex-col gap-3">
                     <label className="text-sm"> Start Frame:
                       <input type="number" min="0" value={currentScene.startFrame} onChange={(e) => handleSceneParamChange("startFrame", e.target.value)} className="ml-2 w-20 p-1 rounded bg-gray-700 border border-gray-600" />
                     </label>
                     <label className="text-sm"> Duration (opt.):
                       <input type="number" min="1" value={currentScene.durationFrames ?? ''} onChange={(e) => handleSceneParamChange("durationFrames", e.target.value)} placeholder="auto" className="ml-2 w-20 p-1 rounded bg-gray-700 border border-gray-600" />
                     </label>
                      <label className="text-sm"> Background Color:
                           <input type="color" value={currentScene.backgroundColor || DEFAULT_BG_COLOR} onChange={(e) => handleSceneColorChange("backgroundColor", e.target.value)} className="ml-2 h-6 w-10 p-0 border-none rounded" />
                      </label>
                       <label className="text-sm"> Secondary Color:
                           <input type="color" value={currentScene.secondaryColor || DEFAULT_SECONDARY_COLOR} onChange={(e) => handleSceneColorChange("secondaryColor", e.target.value)} className="ml-2 h-6 w-10 p-0 border-none rounded" />
                       </label>
                       <button onClick={handleCopyGridFromPrevious} disabled={selectedSceneIndex === 0} className="mt-2 px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                           Copy Grid from Previous
                       </button>
                  </div>
               ) : (
                  <p className="text-sm text-gray-500">Select a scene to view settings.</p>
               )}
             </PanelWrapper>

             {/* Selected Cell Settings */}
             <PanelWrapper title="Selected Cell Settings" className="flex-1">
               {selectedCellCoords && currentScene ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm">Editing Cell: [{selectedCellCoords.row}, {selectedCellCoords.col}]</p>
                    <label className="text-sm"> Character:
                       {/* Simple input for single character */}
                       <input
                         ref={hiddenInputRef} // Use ref for potential focus later
                         type="text"
                         maxLength={1} // Allow only one character
                         value={selectedCellData?.char ?? ''}
                         onChange={(e) => { /* This requires a modified handler or direct update */
                            // Simplified: Update state directly (needs handler adjustment ideally)
                            const newChar = e.target.value.slice(0, 1); // Ensure only one char
                            const newScenes = [...scenes];
                            const sceneToEdit = newScenes[selectedSceneIndex!]; // Assume index is valid
                            if (!sceneToEdit.layoutGrid[selectedCellCoords.row]) {
                                sceneToEdit.layoutGrid[selectedCellCoords.row] = [];
                            }
                            if (!sceneToEdit.layoutGrid[selectedCellCoords.row][selectedCellCoords.col]) {
                                sceneToEdit.layoutGrid[selectedCellCoords.row][selectedCellCoords.col] = { char: newChar, color: lastUsedColor };
                            } else {
                                sceneToEdit.layoutGrid[selectedCellCoords.row][selectedCellCoords.col]!.char = newChar;
                            }
                            setScenes(newScenes);
                         }}
                         onKeyDown={handleCellCharacterInput} // Keep complex logic here
                         className="ml-2 w-10 p-1 rounded bg-gray-700 border border-gray-600 text-center font-mono"
                       />
                    </label>
                     <label className="text-sm"> Text Color:
                       <input
                         type="color"
                         value={selectedCellData?.color ?? lastUsedColor}
                         onChange={handleSelectedCellColorChange}
                         className="ml-2 h-6 w-10 p-0 border-none rounded"
                       />
                     </label>
                  </div>
                ) : (
                   <p className="text-sm text-gray-500">Click a cell in the grid preview to edit.</p>
                )}
             </PanelWrapper>
          </div>

          {/* Bottom Row: Grid Preview - takes remaining space */}
          <PanelWrapper title="Grid Preview" className="flex-1 overflow-hidden flex flex-col"> {/* Allow preview to take space */}
             {currentScene ? (
                // Center the grid within this panel
               <div className="flex-1 overflow-auto flex items-center justify-center"> 
                 <GridDisplay
                   rows={gridRows}
                   cols={gridCols}
                   layoutGrid={currentScene.layoutGrid}
                   selectedCellCoords={selectedCellCoords}
                   onCellClick={handleCellClick}
                   backgroundColor={currentScene.backgroundColor}
                   secondaryColor={currentScene.secondaryColor}
                 />
               </div>
             ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Select a scene to view its grid.</p>
                </div>
             )}
          </PanelWrapper>
          
      </main>

      {/* Hidden input for character entry (if needed, keep logic) */}
      {/* <input ref={hiddenInputRef} ... /> */}
    </div>
  );
};

export default TimelineEditor;
