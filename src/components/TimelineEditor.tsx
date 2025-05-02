import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";

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
    return <div style={{ color: "red" }}>Invalid grid dimensions</div>;
  }

  const gridBg = backgroundColor || DEFAULT_BG_COLOR;
  const cellSecondaryBg = secondaryColor || DEFAULT_SECONDARY_COLOR;

  const cellStyleBase: React.CSSProperties = {
    border: "1px solid #555",
    minWidth: "35px", // Slightly larger cells
    minHeight: "35px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px", // Larger font
    color: "#ccc",
    overflow: "hidden",
    boxSizing: "border-box",
    position: "relative", // Needed for potential input overlay later
    cursor: "pointer",
    userSelect: "none", // Prevent text selection
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, auto)`,
    gridTemplateRows: `repeat(${rows}, auto)`,
    border: "1px solid #aaa",
    maxWidth: "fit-content",
    margin: "20px 0",
    backgroundColor: gridBg, // Use scene or default background
  };

  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellData = layoutGrid?.[r]?.[c];
      const isSelected =
        selectedCellCoords?.row === r && selectedCellCoords?.col === c;

      const cellStyle: React.CSSProperties = {
        ...cellStyleBase,
        backgroundColor: cellData
          ? isSelected
            ? "#445588"
            : "#333"
          : isSelected
          ? "#445588"
          : cellSecondaryBg,
        color: cellData?.color || (isSelected ? "#fff" : "#ccc"),
        fontWeight: cellData ? "bold" : "normal",
      };

      cells.push(
        <div
          key={`${r}-${c}`}
          style={cellStyle}
          onClick={() => onCellClick(r, c)}
          title={`Cell [${r}, ${c}]`} // Tooltip
        >
          {cellData?.char || ""} {/* Display char or empty */}
        </div>
      );
    }
  }

  return (
    <div>
      <h4>
        Click a cell to select/edit ({rows} x {cols})
      </h4>
      <div style={gridStyle}>{cells}</div>
    </div>
  );
};

// Key for localStorage
const LOCAL_STORAGE_KEY = "timelineEditorState";

// --- Main Editor Component ---
const TimelineEditor: React.FC = () => {
  // --- State Initialization ---
  const [gridCols, setGridCols] = useState<number>(INITIAL_GRID_COLS);
  const [gridRows, setGridRows] = useState<number>(INITIAL_GRID_ROWS);
  const [scenes, setScenes] = useState<EditableScene[]>([]);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(
    null
  );
  const [selectedCellCoords, setSelectedCellCoords] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [nextSceneId, setNextSceneId] = useState<number>(0);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const wordsJsonInputRef = useRef<HTMLInputElement>(null); // Ref for words JSON input
  const [exportJson, setExportJson] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastUsedColor, setLastUsedColor] = useState<string>("#ffffff");
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [livePreviewActiveSceneIndex, setLivePreviewActiveSceneIndex] =
    useState<number | null>(null);
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

  // --- Effect to calculate live preview active scene ---
  useEffect(() => {
    if (!scenes || scenes.length === 0) {
      setLivePreviewActiveSceneIndex(null);
      return;
    }
    let activeIndex: number | null = null;
    // Loop backwards like in the animation logic to find the correct scene
    for (let i = scenes.length - 1; i >= 0; i--) {
      // Ensure startFrame is a number before comparing
      const startFrameNum = Number(scenes[i].startFrame);
      if (!isNaN(startFrameNum) && currentFrame >= startFrameNum) {
        activeIndex = i;
        break;
      }
    }
    setLivePreviewActiveSceneIndex(activeIndex);
  }, [currentFrame, scenes]); // Re-calculate when frame or scenes change

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
  const handleImportWordsJson = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result;
      if (typeof text !== "string") {
        alert("Error reading file content.");
        return;
      }
      try {
        const wordsData: WordData[] = JSON.parse(text);

        // Basic validation
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
          const duration = Math.max(
            1,
            wordData.frame_end - wordData.frame_start
          ); // Ensure min duration of 1 frame
          const word = wordData.word.trim();
          const characters = word.split("");

          // Create empty grid based on *current* editor settings
          const newLayoutGrid: (EditableLayoutCell | null)[][] = Array.from(
            { length: gridRows },
            () => Array(gridCols).fill(null)
          );

          // Attempt to center the word
          const middleRow = Math.floor(gridRows / 2);
          const startCol = Math.max(
            0,
            Math.floor((gridCols - characters.length) / 2)
          );

          // Place characters onto the grid
          if (middleRow < gridRows) {
            // Ensure middleRow is valid
            for (let i = 0; i < characters.length; i++) {
              const currentCol = startCol + i;
              if (currentCol < gridCols) {
                // Ensure currentCol is valid
                newLayoutGrid[middleRow][currentCol] = {
                  char: characters[i],
                  color: "#FFFFFF", // Default to white, user can change later
                };
              }
            }
          }

          const newScene: EditableScene = {
            id: currentId++,
            startFrame: wordData.frame_start,
            durationFrames: duration,
            layoutGrid: newLayoutGrid,
            // Use defaults, user will customize
            stylePresets: {
              filler: { color: DEFAULT_SECONDARY_COLOR },
              default: { color: "#FFFFFF" },
            },
            backgroundColor: DEFAULT_BG_COLOR,
            secondaryColor: DEFAULT_SECONDARY_COLOR,
          };
          return newScene;
        });

        // Replace existing scenes
        setScenes(newScenes);
        setNextSceneId(currentId); // Update next ID counter
        setSelectedSceneIndex(newScenes.length > 0 ? 0 : null); // Select first scene
        setSelectedCellCoords(null); // Deselect cell
        alert(
          `Successfully imported ${newScenes.length} scenes from words.json!`
        );
      } catch (error: any) {
        console.error("Failed to parse or process words JSON:", error);
        alert(`Error importing words JSON: ${error.message}`);
      }
    };
    reader.onerror = () => {
      alert("Error reading file.");
    };
    reader.readAsText(file);

    // Reset the input value so the same file can be selected again if needed
    event.target.value = "";
  };

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

  const handleGenerateExport = () => {
    // 1. Show immediate feedback
    setExportJson("Generating...");

    // 2. Calculate and set the actual JSON slightly later
    setTimeout(() => {
      try {
        const animationScenes = convertEditableToAnimationScenes(scenes);
        const jsonString = JSON.stringify(animationScenes, null, 2);
        setExportJson(jsonString);
      } catch (error) {
        console.error("Error generating export JSON:", error);
        setExportJson("Error generating JSON. Check console.");
      }
    }, 10); // Short delay (10ms) to allow UI update for "Generating..."
  };

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

  // --- Styles --- (Copied from previous example, adjusted slightly)
  const editorStyle: React.CSSProperties = {
    display: "flex",
    gap: "20px",
    padding: "20px",
    fontFamily: "sans-serif",
    flexWrap: "wrap",
  };
  const sectionStyle: React.CSSProperties = {
    border: "1px solid #ccc",
    padding: "15px",
    minWidth: "200px",
    backgroundColor: "#f9f9f9",
    alignSelf: "flex-start",
  };
  const listStyle: React.CSSProperties = {
    listStyle: "none",
    padding: 0,
    margin: 0,
    maxHeight: "300px",
    overflowY: "auto",
  };
  const listItemStyle: React.CSSProperties = {
    padding: "5px",
    marginBottom: "5px",
    border: "1px solid transparent",
    borderRadius: "3px",
    fontSize: "0.9em",
  };
  const selectedListItemStyle: React.CSSProperties = {
    ...listItemStyle,
    border: "1px dashed blue",
    backgroundColor: "#e0e0ff",
  };
  const livePreviewActiveListItemStyle: React.CSSProperties = {
    ...listItemStyle,
    backgroundColor: "#d0f0d0",
    fontWeight: "bold",
  };
  const inputGroupStyle: React.CSSProperties = { marginBottom: "10px" };
  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "3px",
    fontSize: "0.9em",
    color: "#333",
  };
  const inputStyle: React.CSSProperties = {
    width: "90%",
    padding: "4px",
    boxSizing: "border-box",
  };
  const smallInputStyle: React.CSSProperties = { ...inputStyle, width: "80px" };
  // Return the hidden input to its original state
  const hiddenInputStyle: React.CSSProperties = {
    position: "absolute",
    top: "-9999px",
    left: "-9999px",
    width: "1px", // Minimal size is fine
    height: "1px",
    opacity: 0,
    border: "none",
    padding: 0,
    margin: 0,
    overflow: "hidden", // Ensure it doesn't affect layout
  };

  const exportTextAreaStyle: React.CSSProperties = {
    width: "95%",
    minHeight: "200px",
    fontFamily: "monospace",
    fontSize: "0.8em",
    marginTop: "10px",
    whiteSpace: "pre",
    overflowWrap: "normal",
    overflowX: "scroll",
  };

  const colorInputStyle: React.CSSProperties = {
    marginLeft: "10px",
    border: "none",
    padding: 0,
    width: "40px",
    height: "20px",
    cursor: "pointer",
    verticalAlign: "middle",
  };

  const sceneButtonContainerStyle: React.CSSProperties = {
    marginLeft: "auto", // Push buttons to the right
    display: "flex",
    gap: "5px",
  };
  const sceneButtonStyle: React.CSSProperties = {
    padding: "1px 4px",
    fontSize: "0.7em",
    cursor: "pointer",
    border: "1px solid #ccc",
    backgroundColor: "#eee",
    borderRadius: "3px",
  };
  const deleteButtonStyle: React.CSSProperties = {
    ...sceneButtonStyle,
    backgroundColor: "#fdd",
    borderColor: "#f99",
    color: "#c00",
  };

  // --- Render ---
  return (
    <div style={editorStyle}>
      {/* Hidden input to capture keydown when a cell is selected */}
      {selectedCellCoords && (
        <input
          ref={hiddenInputRef}
          type="text"
          style={hiddenInputStyle}
          onKeyDown={handleCellCharacterInput}
        />
      )}

      {/* Hidden input for words json import */}
      <input
        ref={wordsJsonInputRef}
        type="file"
        accept=".json"
        onChange={handleImportWordsJson}
        style={{ display: "none" }}
      />

      {/* Column 1: Global Settings & Audio */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          minWidth: "250px",
        }}
      >
        {/* Global Settings */}
        <div style={sectionStyle}>
          <h3>Global Grid</h3>
          <div style={inputGroupStyle}>
            <label style={labelStyle} htmlFor="gridCols">
              Columns:
            </label>
            <input
              style={smallInputStyle}
              type="number"
              id="gridCols"
              min="1"
              value={gridCols}
              onChange={(e) => handleGridSizeChange("cols", e.target.value)}
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle} htmlFor="gridRows">
              Rows:
            </label>
            <input
              style={smallInputStyle}
              type="number"
              id="gridRows"
              min="1"
              value={gridRows}
              onChange={(e) => handleGridSizeChange("rows", e.target.value)}
            />
          </div>
        </div>

        {/* Audio Player & Frame Counter */}
        <div style={sectionStyle}>
          <h3>Audio Sync</h3>
          <div style={inputGroupStyle}>
            <label style={labelStyle} htmlFor="audioFile">
              Select Audio:
            </label>
            <input
              type="file"
              id="audioFile"
              accept="audio/*"
              onChange={handleAudioFileChange}
              style={{ ...inputStyle, width: "auto" }}
            />
          </div>
          {audioSrc && (
            <div>
              <audio
                ref={audioRef}
                src={audioSrc}
                controls
                onTimeUpdate={handleTimeUpdate}
                style={{ width: "100%", marginTop: "10px" }}
              />
              <p style={{ marginTop: "5px", fontWeight: "bold" }}>
                Current Frame: {currentFrame}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Column 2: Scenes List & Live Preview */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          minWidth: "250px",
        }}
      >
        {/* Scenes List (Editor Selection) */}
        <div style={sectionStyle}>
          <h3>Scenes</h3>
          <ul style={listStyle}>
            {scenes.map((scene, index) => (
              <li
                key={scene.id}
                // Style for editor selection
                style={
                  index === selectedSceneIndex
                    ? selectedListItemStyle
                    : listItemStyle
                }
                onClick={() => handleSelectScene(index)}
              >
                Scene {index} (Start: {scene.startFrame})
                <div style={sceneButtonContainerStyle}>
                  <button
                    style={sceneButtonStyle}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent li onClick
                      handleDuplicateScene(index);
                    }}
                    title="Duplicate Scene"
                  >
                    Dup
                  </button>
                  <button
                    style={deleteButtonStyle}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent li onClick
                      handleDeleteScene(index);
                    }}
                    title="Delete Scene"
                  >
                    Del
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
            <button onClick={handleAddScene}>+ Add Scene</button>
            <button onClick={() => wordsJsonInputRef.current?.click()}>
              Import Words JSON
            </button>
          </div>
        </div>

        {/* Live Timeline Preview */}
        <div style={sectionStyle}>
          <h3>Timeline Preview (Live)</h3>
          <ul style={listStyle}>
            {scenes.map((scene, index) => (
              <li
                key={`${scene.id}-live`}
                // Style for live preview highlighting
                style={
                  index === livePreviewActiveSceneIndex
                    ? livePreviewActiveListItemStyle
                    : listItemStyle
                }
              >
                Scene {index} (Start: {scene.startFrame})
                {scene.durationFrames && ` | Dur: ${scene.durationFrames}`}
              </li>
            ))}
            {livePreviewActiveSceneIndex === null && scenes.length > 0 && (
              <li style={listItemStyle}>
                <em>(Before first scene)</em>
              </li>
            )}
            {scenes.length === 0 && (
              <li style={listItemStyle}>
                <em>(No scenes defined)</em>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Column 3: Scene/Cell Settings & Grid Preview */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          flexGrow: 1,
        }}
      >
        {/* Selected Scene Settings */}
        <div style={sectionStyle}>
          <h3>Scene Settings</h3>
          {currentScene ? (
            <>
              <div style={inputGroupStyle}>
                {" "}
                <label style={labelStyle} htmlFor="startFrame">
                  Start Frame:
                </label>{" "}
                <input
                  style={smallInputStyle}
                  type="number"
                  id="startFrame"
                  min="0"
                  value={currentScene.startFrame}
                  onChange={(e) =>
                    handleSceneParamChange("startFrame", e.target.value)
                  }
                />{" "}
              </div>
              <div style={inputGroupStyle}>
                {" "}
                <label style={labelStyle} htmlFor="durationFrames">
                  Duration (opt.):
                </label>{" "}
                <input
                  style={smallInputStyle}
                  type="number"
                  id="durationFrames"
                  min="1"
                  value={currentScene.durationFrames ?? ""}
                  onChange={(e) =>
                    handleSceneParamChange("durationFrames", e.target.value)
                  }
                  placeholder="auto"
                />{" "}
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle} htmlFor="bgColor">
                  Background Color:
                </label>
                <input
                  type="color"
                  id="bgColor"
                  value={currentScene.backgroundColor ?? "#000000"} // Default picker to black if unset
                  onChange={(e) =>
                    handleSceneColorChange("backgroundColor", e.target.value)
                  }
                  style={colorInputStyle}
                />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle} htmlFor="secondaryColor">
                  Secondary Color:
                </label>
                <input
                  type="color"
                  id="secondaryColor"
                  value={currentScene.secondaryColor ?? "#808080"} // Default picker to gray if unset
                  onChange={(e) =>
                    handleSceneColorChange("secondaryColor", e.target.value)
                  }
                  style={colorInputStyle}
                />
              </div>
              {/* NEW: Copy Grid Button */}
              {selectedSceneIndex !== null && selectedSceneIndex > 0 && (
                <button
                  onClick={handleCopyGridFromPrevious}
                  style={{ marginTop: "10px" }}
                >
                  Copy Grid from Previous
                </button>
              )}
            </>
          ) : (
            <p>Select a scene.</p>
          )}
        </div>

        {/* Selected Cell Settings */}
        <div style={sectionStyle}>
          <h3>Selected Cell Settings</h3>
          {selectedCellCoords && currentScene ? (
            <>
              <p>
                Editing Cell: [{selectedCellCoords.row},{" "}
                {selectedCellCoords.col}]
              </p>
              <p>
                <i>
                  Press any character key to set, Backspace/Delete to clear.
                </i>
              </p>
              <div style={inputGroupStyle}>
                <label style={labelStyle} htmlFor="cellCharPreview">
                  Character:
                </label>
                <input
                  style={{
                    ...inputStyle,
                    width: "40px",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                  type="text"
                  id="cellCharPreview"
                  value={selectedCellData?.char ?? ""}
                  readOnly
                />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle} htmlFor="cellColor">
                  Color:
                </label>
                <input
                  type="color"
                  id="cellColor"
                  value={selectedCellData?.color ?? "#ffffff"}
                  onChange={handleSelectedCellColorChange}
                  style={{
                    border: "none",
                    padding: 0,
                    width: "50px",
                    height: "30px",
                    cursor: "pointer",
                  }}
                />
              </div>
            </>
          ) : (
            <p>Click a cell in the grid preview to edit.</p>
          )}
        </div>

        {/* Grid Preview (Editor) */}
        <div style={{ ...sectionStyle, flexGrow: 1 }}>
          {currentScene ? (
            <GridDisplay
              rows={gridRows}
              cols={gridCols}
              layoutGrid={currentScene.layoutGrid}
              selectedCellCoords={selectedCellCoords}
              onCellClick={handleCellClick}
              backgroundColor={currentScene.backgroundColor}
              secondaryColor={currentScene.secondaryColor}
            />
          ) : (
            <p style={{ color: "#888" }}>
              Add or select a scene to see the grid preview.
            </p>
          )}
        </div>
      </div>

      {/* Export Section (Full Width) */}
      <div style={{ ...sectionStyle, width: "100%", order: 99 }}>
        <h3>Export Timeline</h3>
        <button onClick={handleGenerateExport}>Generate Export JSON</button>
        {exportJson && (
          <textarea
            style={exportTextAreaStyle}
            value={exportJson}
            readOnly
            onClick={(e) => (e.target as HTMLTextAreaElement).select()} // Select all on click
          />
        )}
      </div>
    </div>
  );
};

export default TimelineEditor;
