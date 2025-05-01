import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';

// Import core types (adjust path if needed)
import { AnimationScene, CellStyle, LayoutCell } from '../animations/unstableGrid2/timeline'; // Adjusted path assuming components is one level above animations

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
const DEFAULT_BG_COLOR = '#282c34'; // Default grid background
const DEFAULT_SECONDARY_COLOR = '#333'; // Default null cell background

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
    return <div style={{ color: 'red' }}>Invalid grid dimensions</div>;
  }

  const gridBg = backgroundColor || DEFAULT_BG_COLOR;
  const cellSecondaryBg = secondaryColor || DEFAULT_SECONDARY_COLOR;

  const cellStyleBase: React.CSSProperties = {
    border: '1px solid #555',
    minWidth: '35px', // Slightly larger cells
    minHeight: '35px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px', // Larger font
    color: '#ccc',
    overflow: 'hidden',
    boxSizing: 'border-box',
    position: 'relative', // Needed for potential input overlay later
    cursor: 'pointer',
    userSelect: 'none', // Prevent text selection
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, auto)`,
    gridTemplateRows: `repeat(${rows}, auto)`,
    border: '1px solid #aaa',
    maxWidth: 'fit-content',
    margin: '20px 0',
    backgroundColor: gridBg, // Use scene or default background
  };

  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellData = layoutGrid?.[r]?.[c];
      const isSelected = selectedCellCoords?.row === r && selectedCellCoords?.col === c;

      const cellStyle: React.CSSProperties = {
        ...cellStyleBase,
        backgroundColor: cellData ? (isSelected ? '#445588' : '#333') : (isSelected ? '#445588' : cellSecondaryBg), 
        color: cellData?.color || (isSelected ? '#fff' : '#ccc'), 
        fontWeight: cellData ? 'bold' : 'normal',
      };

      cells.push(
        <div
          key={`${r}-${c}`}
          style={cellStyle}
          onClick={() => onCellClick(r, c)}
          title={`Cell [${r}, ${c}]`} // Tooltip
        >
          {cellData?.char || ''} {/* Display char or empty */}
        </div>
      );
    }
  }

  return (
    <div>
      <h4>Click a cell to select/edit ({rows} x {cols})</h4>
      <div style={gridStyle}>{cells}</div>
    </div>
  );
};

// --- Main Editor Component ---
const TimelineEditor: React.FC = () => {
  const [gridCols, setGridCols] = useState<number>(INITIAL_GRID_COLS);
  const [gridRows, setGridRows] = useState<number>(INITIAL_GRID_ROWS);
  const [scenes, setScenes] = useState<EditableScene[]>([]);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(null);
  const [selectedCellCoords, setSelectedCellCoords] = useState<{ row: number; col: number } | null>(null);
  const [nextSceneId, setNextSceneId] = useState<number>(0);
  const hiddenInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden input
  const [exportJson, setExportJson] = useState<string>(''); // State for the export JSON string

  // Memoize current scene and cell data to avoid unnecessary calculations
  const currentScene = useMemo(() => {
      return selectedSceneIndex !== null ? scenes[selectedSceneIndex] : null;
  }, [scenes, selectedSceneIndex]);

  const selectedCellData = useMemo(() => {
      if (!currentScene || !selectedCellCoords) return null;
      return currentScene.layoutGrid?.[selectedCellCoords.row]?.[selectedCellCoords.col] ?? null;
  }, [currentScene, selectedCellCoords]);

  // Effect to focus the hidden input when a cell is selected
  useEffect(() => {
      if (selectedCellCoords && hiddenInputRef.current) {
          hiddenInputRef.current.focus();
      }
  }, [selectedCellCoords]); // Dependency array ensures this runs when selection changes

  // --- Callbacks ---
  const handleGridSizeChange = (dimension: 'rows' | 'cols', value: string) => {
      const numValue = Math.max(1, parseInt(value, 10) || 1);
      if (dimension === 'rows') setGridRows(numValue);
      else setGridCols(numValue);
      // TODO: Optionally resize existing layoutGrids in scenes? Or warn user?
      // For now, new scenes will use the new size. Existing scenes remain.
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
      startFrame: scenes.length > 0 ? (scenes[scenes.length - 1].startFrame + (scenes[scenes.length - 1].durationFrames || 60)) : 0,
      durationFrames: 60,
      layoutGrid: newLayoutGrid,
      stylePresets: { // Start with a basic filler preset
          'filler': { color: '#555555'}
      },
    };
    const newScenes = [...scenes, newScene];
    setScenes(newScenes);
    setNextSceneId(nextSceneId + 1);
    setSelectedSceneIndex(newScenes.length - 1); // Select new scene
    setSelectedCellCoords(null); // Deselect cell
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
  const handleCellCharacterInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
      console.log('[Input KeyDown] Key:', event.key); // Log the pressed key
      if (!currentScene || !selectedCellCoords) {
           console.log('[Input KeyDown] Aborted: No current scene or cell selected.');
           return;
      }

      // Allow only single character input, or Backspace/Delete to clear
      let newChar = '';
      if (event.key.length === 1) {
          newChar = event.key;
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
          newChar = ''; // Clear character
      } else {
          console.log('[Input KeyDown] Key ignored:', event.key);
          event.preventDefault(); // Prevent other keys like Enter, Tab, etc.
          return;
      }
      event.preventDefault(); // Prevent default input behavior

      console.log(`[Input KeyDown] Calling handleCellChange for [${selectedCellCoords.row}, ${selectedCellCoords.col}] with char: '${newChar}'`);
      handleCellChange(selectedCellCoords.row, selectedCellCoords.col, { char: newChar });
  };

  // General purpose function to update parts of a cell's data immutably
  const handleCellChange = useCallback(
    (row: number, col: number, updates: Partial<EditableLayoutCell>) => {
      console.log(`[handleCellChange] Updating cell [${row}, ${col}] with:`, updates); // Log updates
      if (selectedSceneIndex === null) return;

      setScenes((prevScenes) => {
          const newScenes = [...prevScenes];
          const sceneToUpdate = { ...newScenes[selectedSceneIndex] }; 
          const newLayoutGrid = sceneToUpdate.layoutGrid.map(r => [...r]); 
          const currentCell = newLayoutGrid[row]?.[col];

          if (updates.char === '' && Object.keys(updates).length === 1) {
               console.log(`[handleCellChange] Clearing cell [${row}, ${col}]`);
               newLayoutGrid[row][col] = null; 
          } else {
              const existingData = currentCell || { char: '' }; 
              
              const newCellData: EditableLayoutCell = {
                  ...existingData,
                  ...updates, 
              };
              
              // Keep logic to remove undefined/empty props
              if (newCellData.color === '') delete newCellData.color;

              // Ensure char is not literally empty string if cell should exist
              if (newCellData.char === '' && newCellData.color) { // Only check color now
                  newCellData.char = existingData.char || ' '; 
              }
              console.log(`[handleCellChange] Setting cell [${row}, ${col}] to:`, newCellData);
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
  const handleSelectedCellColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (selectedCellCoords) {
          handleCellChange(selectedCellCoords.row, selectedCellCoords.col, { color: event.target.value });
      }
  };

  // --- Scene Parameter Editing ---
   const handleSceneParamChange = (
     param: keyof EditableScene,
     value: string | number
   ) => {
     if (selectedSceneIndex === null) return;
     setScenes(prevScenes => {
         const updatedScenes = [...prevScenes];
         const sceneToUpdate = { ...updatedScenes[selectedSceneIndex] };
         
         // Handle numeric values
         if (param === 'startFrame' || param === 'durationFrames') {
             const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;
             if (!isNaN(numericValue)) {
                 (sceneToUpdate[param as 'startFrame' | 'durationFrames']) = numericValue >= 0 ? numericValue : 0;
             } else if (param === 'durationFrames' && value === '') {
                 delete sceneToUpdate.durationFrames;
             }
         } 
         // Handle string values (colors)
         else if (param === 'backgroundColor' || param === 'secondaryColor') {
             sceneToUpdate[param] = value === '' ? undefined : String(value); // Store as string or undefined
         }
         
         updatedScenes[selectedSceneIndex] = sceneToUpdate;
         return updatedScenes;
     });
   };

  // --- Export Logic ---
  const convertEditableToAnimationScenes = (editableScenes: EditableScene[]): AnimationScene[] => {
    return editableScenes.map(scene => {
        const newLayoutGrid: (LayoutCell | null)[][] = scene.layoutGrid.map(row => 
            row.map(cell => {
                if (!cell) return null;

                // Always return object format
                const layoutCell: { char: string; style?: CellStyle } = {
                    char: cell.char,
                };
                
                // Add style object ONLY if color exists
                if (cell.color) {
                    // Assuming CellStyle = { color: string } based on previous errors
                    layoutCell.style = { color: cell.color }; 
                }

                return layoutCell;
            })
        );

        // Construct the AnimationScene
        const animationScene: AnimationScene = {
            startFrame: scene.startFrame,
            layoutGrid: newLayoutGrid,
            stylePresets: scene.stylePresets,
            // Add scene colors if they exist
            ...(scene.backgroundColor && { backgroundColor: scene.backgroundColor }),
            ...(scene.secondaryColor && { secondaryColor: scene.secondaryColor }),
        };
        if (scene.durationFrames !== undefined) {
            animationScene.durationFrames = scene.durationFrames;
        }

        return animationScene;
    });
  };

  const handleGenerateExport = () => {
      const animationScenes = convertEditableToAnimationScenes(scenes);
      const jsonString = JSON.stringify(animationScenes, null, 2);
      setExportJson(jsonString);
  };

  // --- Styles --- (Copied from previous example, adjusted slightly)
   const editorStyle: React.CSSProperties = { display: 'flex', gap: '20px', padding: '20px', fontFamily: 'sans-serif', flexWrap: 'wrap' };
   const sectionStyle: React.CSSProperties = { border: '1px solid #ccc', padding: '15px', minWidth: '200px', backgroundColor: '#f9f9f9'};
   const listStyle: React.CSSProperties = { listStyle: 'none', padding: 0, maxHeight: '300px', overflowY: 'auto'};
   const listItemStyle: React.CSSProperties = { padding: '5px', cursor: 'pointer', marginBottom: '5px', border: '1px solid transparent', borderRadius: '3px' };
   const selectedListItemStyle: React.CSSProperties = { ...listItemStyle, border: '1px dashed blue', backgroundColor: '#e0e0ff' };
   const inputGroupStyle: React.CSSProperties = { marginBottom: '10px' };
   const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '3px', fontSize: '0.9em', color: '#333' };
   const inputStyle: React.CSSProperties = { width: '90%', padding: '4px', boxSizing: 'border-box' };
   const smallInputStyle: React.CSSProperties = { ...inputStyle, width: '80px'};
   // Return the hidden input to its original state
   const hiddenInputStyle: React.CSSProperties = {
       position: 'absolute',
       top: '-9999px',
       left: '-9999px',
       width: '1px', // Minimal size is fine
       height: '1px', 
       opacity: 0,
       border: 'none',
       padding: 0,
       margin: 0,
       overflow: 'hidden' // Ensure it doesn't affect layout
   };

   const exportTextAreaStyle: React.CSSProperties = {
       width: '95%',
       minHeight: '200px',
       fontFamily: 'monospace',
       fontSize: '0.8em',
       marginTop: '10px',
       whiteSpace: 'pre',
       overflowWrap: 'normal',
       overflowX: 'scroll'
   };

   const colorInputStyle: React.CSSProperties = { 
       marginLeft: '10px', 
       border: 'none', 
       padding: 0, 
       width: '40px', 
       height: '20px', 
       cursor: 'pointer', 
       verticalAlign: 'middle' 
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
           <label style={labelStyle} htmlFor="gridCols">Columns:</label>
           <input style={smallInputStyle} type="number" id="gridCols" min="1" value={gridCols} onChange={(e) => handleGridSizeChange('cols', e.target.value)} />
         </div>
         <div style={inputGroupStyle}>
           <label style={labelStyle} htmlFor="gridRows">Rows:</label>
           <input style={smallInputStyle} type="number" id="gridRows" min="1" value={gridRows} onChange={(e) => handleGridSizeChange('rows', e.target.value)} />
         </div>
      </div>

      {/* Scenes List */}
      <div style={sectionStyle}>
        <h3>Scenes</h3>
        <ul style={listStyle}>
          {scenes.map((scene, index) => ( <li key={scene.id} style={index === selectedSceneIndex ? selectedListItemStyle : listItemStyle} onClick={() => handleSelectScene(index)} > Scene {index} (Start: {scene.startFrame}) </li> ))}
        </ul>
        <button onClick={handleAddScene}>+ Add Scene</button>
      </div>

      {/* Selected Scene Settings */}
      <div style={sectionStyle}>
        <h3>Scene Settings</h3>
        {currentScene ? ( 
          <> 
            <div style={inputGroupStyle}> <label style={labelStyle} htmlFor="startFrame">Start Frame:</label> <input style={smallInputStyle} type="number" id="startFrame" min="0" value={currentScene.startFrame} onChange={(e) => handleSceneParamChange('startFrame', e.target.value)} /> </div> 
            <div style={inputGroupStyle}> <label style={labelStyle} htmlFor="durationFrames">Duration (opt.):</label> <input style={smallInputStyle} type="number" id="durationFrames" min="1" value={currentScene.durationFrames ?? ''} onChange={(e) => handleSceneParamChange('durationFrames', e.target.value)} placeholder="auto" /> </div> 
            <div style={inputGroupStyle}> 
              <label style={labelStyle} htmlFor="bgColor">Background Color:</label> 
              <input 
                type="color" 
                id="bgColor" 
                value={currentScene.backgroundColor ?? '#000000'} // Default picker to black if unset
                onChange={(e) => handleSceneParamChange('backgroundColor', e.target.value)}
                style={colorInputStyle}
              />
            </div> 
            <div style={inputGroupStyle}> 
              <label style={labelStyle} htmlFor="secondaryColor">Secondary Color:</label> 
              <input 
                type="color" 
                id="secondaryColor" 
                value={currentScene.secondaryColor ?? '#808080'} // Default picker to gray if unset
                onChange={(e) => handleSceneParamChange('secondaryColor', e.target.value)}
                style={colorInputStyle}
              />
            </div> 
          </>
        ) : ( <p>Select a scene.</p> )}
      </div>

      {/* Selected Cell Settings */}
       <div style={sectionStyle}>
            <h3>Selected Cell Settings</h3>
            {selectedCellCoords && currentScene ? (
                 <>
                    <p>Editing Cell: [{selectedCellCoords.row}, {selectedCellCoords.col}]</p>
                    <p><i>Press any character key to set, Backspace/Delete to clear.</i></p>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle} htmlFor="cellCharPreview">Character:</label>
                        <input style={{...inputStyle, width: '40px', textAlign: 'center', fontWeight: 'bold'}} type="text" id="cellCharPreview" value={selectedCellData?.char ?? ''} readOnly />
                    </div>
                    <div style={inputGroupStyle}>
                       <label style={labelStyle} htmlFor="cellColor">Color:</label>
                       <input
                         type="color"
                         id="cellColor"
                         value={selectedCellData?.color ?? '#ffffff'} 
                         onChange={handleSelectedCellColorChange}
                         style={{ border: 'none', padding: 0, width: '50px', height: '30px', cursor: 'pointer'}}
                       />
                     </div>
                 </>
            ) : (
                <p>Click a cell in the grid preview to edit.</p>
            )}
       </div>

      {/* Grid Preview */}
      <div style={{...sectionStyle, flexGrow: 1, minWidth: '300px'}}>
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
                <p style={{color: '#888'}}>Add or select a scene to see the grid preview.</p>
            )}
       </div>

       {/* Export Section */}
       <div style={{...sectionStyle, width: '100%', order: 99}}> {/* Use order to place it last? Or adjust flex layout */} 
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