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
  // Initialize state with potentially null/default values first
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
  const [exportJson, setExportJson] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false); // Flag to prevent saving before loading

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

    // Allow only single character input, or Backspace/Delete to clear
    let newChar = "";
    if (event.key.length === 1) {
      newChar = event.key;
    } else if (event.key === "Backspace" || event.key === "Delete") {
      newChar = ""; // Clear character
    } else {
      console.log("[Input KeyDown] Key ignored:", event.key);
      event.preventDefault(); // Prevent other keys like Enter, Tab, etc.
      return;
    }
    event.preventDefault(); // Prevent default input behavior

    console.log(
      `[Input KeyDown] Calling handleCellChange for [${selectedCellCoords.row}, ${selectedCellCoords.col}] with char: '${newChar}'`
    );
    handleCellChange(selectedCellCoords.row, selectedCellCoords.col, {
      char: newChar,
    });
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

          const newCellData: EditableLayoutCell = {
            ...existingData,
            ...updates,
          };

          // Keep logic to remove undefined/empty props
          if (newCellData.color === "") delete newCellData.color;

          // Ensure char is not literally empty string if cell should exist
          if (newCellData.char === "" && newCellData.color) {
            // Only check color now
            newCellData.char = existingData.char || " ";
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
    [selectedSceneIndex]
  );

  // Update color for selected cell
  const handleSelectedCellColorChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (selectedCellCoords) {
      handleCellChange(selectedCellCoords.row, selectedCellCoords.col, {
        color: event.target.value,
      });
    }
  };

  // --- Scene Parameter Editing ---
  const handleSceneParamChange = (
    param: keyof EditableScene,
    value: string | number
  ) => {
    if (selectedSceneIndex === null) return;
    setScenes((prevScenes) => {
      const updatedScenes = [...prevScenes];
      const sceneToUpdate = { ...updatedScenes[selectedSceneIndex] };

      // Handle numeric values
      if (param === "startFrame" || param === "durationFrames") {
        const numericValue =
          typeof value === "string" ? parseInt(value, 10) : value;
        if (!isNaN(numericValue)) {
          sceneToUpdate[param as "startFrame" | "durationFrames"] =
            numericValue >= 0 ? numericValue : 0;
        } else if (param === "durationFrames" && value === "") {
          delete sceneToUpdate.durationFrames;
        }
      }
      // Handle string values (colors)
      else if (param === "backgroundColor" || param === "secondaryColor") {
        sceneToUpdate[param] = value === "" ? undefined : String(value); // Store as string or undefined
      }

      updatedScenes[selectedSceneIndex] = sceneToUpdate;
      return updatedScenes;
    });
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
  };
  const listStyle: React.CSSProperties = {
    listStyle: "none",
    padding: 0,
    maxHeight: "300px",
    overflowY: "auto",
  };
  const listItemStyle: React.CSSProperties = {
    padding: "5px",
    cursor: "pointer",
    marginBottom: "5px",
    border: "1px solid transparent",
    borderRadius: "3px",
  };
  const selectedListItemStyle: React.CSSProperties = {
    ...listItemStyle,
    border: "1px dashed blue",
    backgroundColor: "#e0e0ff",
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

      {/* Scenes List - Modified */}
      <div style={sectionStyle}>
        <h3>Scenes</h3>
        <ul style={listStyle}>
          {scenes.map((scene, index) => (
            <li
              key={scene.id}
              style={{
                ...(index === selectedSceneIndex
                  ? selectedListItemStyle
                  : listItemStyle),
                display: "flex", // Use flex to align items
                alignItems: "center",
              }}
              onClick={() => handleSelectScene(index)}
            >
              Scene {index} (Start: {scene.startFrame}){/* Button Container */}
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
        <button onClick={handleAddScene}>+ Add Scene</button>
      </div>

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
                  handleSceneParamChange("backgroundColor", e.target.value)
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
                  handleSceneParamChange("secondaryColor", e.target.value)
                }
                style={colorInputStyle}
              />
            </div>
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
              Editing Cell: [{selectedCellCoords.row}, {selectedCellCoords.col}]
            </p>
            <p>
              <i>Press any character key to set, Backspace/Delete to clear.</i>
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

      {/* Grid Preview */}
      <div style={{ ...sectionStyle, flexGrow: 1, minWidth: "300px" }}>
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

      {/* Export Section */}
      <div style={{ ...sectionStyle, width: "100%", order: 99 }}>
        {" "}
        {/* Use order to place it last? Or adjust flex layout */}
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
