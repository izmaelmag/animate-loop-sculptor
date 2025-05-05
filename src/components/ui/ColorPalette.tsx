import React, { useState, useRef, useEffect, useMemo } from "react";
import { HexColorPicker } from "react-colorful";
import { usePopper } from "react-popper";
import { useColorPaletteStore } from "@/stores/colorPaletteStore"; // Adjust path if needed
import { Edit2, Check } from "lucide-react"; // Icons for controls

// MODIFIED: useClickOutside hook now expects an array of refs OR elements to ignore
const useClickOutside = (
  elementsToIgnore: (React.RefObject<HTMLElement | null> | HTMLElement | null)[], // Accept refs or elements
  handler: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      let containedInIgnoredElement = false;
      const target = event.target as Node; // Get the event target

      for (const elementOrRef of elementsToIgnore) {
        if (!elementOrRef) continue; // Skip null/undefined entries

        let checkElement: HTMLElement | null = null;

        // Check if it's a RefObject
        if (typeof elementOrRef === 'object' && 'current' in elementOrRef) {
          checkElement = elementOrRef.current;
        } 
        // Check if it's a direct HTMLElement
        else if (elementOrRef instanceof HTMLElement) {
          checkElement = elementOrRef;
        }

        // Perform the contains check if we have a valid element
        if (checkElement && checkElement.contains(target)) {
          containedInIgnoredElement = true;
          break;
        }
      }

      if (!containedInIgnoredElement) {
        handler(event);
      }
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  // Ensure dependencies are correct
  }, [elementsToIgnore, handler]); 
};

interface ColorPaletteProps {
  onSelect: (color: string) => void; // Callback function when a color is selected in USE mode
  className?: string; // Optional additional CSS classes
}

const ColorPalette: React.FC<ColorPaletteProps> = ({
  onSelect,
  className = "",
}) => {
  // Get state and actions from Zustand store
  const { colors, updateColor } = useColorPaletteStore();

  // Internal state for the component
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // Index of the square being edited
  const [pickerColor, setPickerColor] = useState("#ffffff"); // Temp color state for the picker

  // Refs for Popper
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<(HTMLDivElement | null)[]>([]); // Refs for each color square
  const currentTriggerRef =
    editingIndex !== null ? triggerRefs.current[editingIndex] : null;

  // Popper setup
  const popperOptions = useMemo(
    () => ({
      placement: "bottom-start" as const,
      modifiers: [{ name: "offset", options: { offset: [0, 8] } }],
    }),
    []
  );

  const {
    styles: popperStyles,
    attributes: popperAttributes,
    update: updatePopper,
  } = usePopper(
    currentTriggerRef, // Use the ref of the currently active trigger square
    popoverRef.current,
    popperOptions
  );

  // Effect to update popper when popover appears/changes trigger
  useEffect(() => {
    if (editingIndex !== null && updatePopper) {
      updatePopper();
    }
  }, [editingIndex, updatePopper]);

  // MODIFIED: useClickOutside ignores popover and the active trigger square
  useClickOutside(
    [
      popoverRef,
      editingIndex !== null ? triggerRefs.current[editingIndex] : null, // Pass the element directly
    ].filter(Boolean) as (React.RefObject<HTMLElement | null> | HTMLElement | null)[], // Filter nulls and assert type for the hook
    () => {
      if (editingIndex !== null) {
        setEditingIndex(null);
      }
    }
  );

  const handleSquareClick = (index: number, color: string | null) => {
    if (isEditing) {
      if (color) {
        // If clicking the already active square, close the picker
        if (index === editingIndex) {
          setEditingIndex(null);
        } else {
          setPickerColor(color);
          setEditingIndex(index);
        }
      } else {
        console.log("Cannot edit empty slot.");
      }
    } else if (color) {
      onSelect(color); // Trigger external onSelect only in use mode
    }
  };

  const handlePickerChange = (newColor: string) => {
    setPickerColor(newColor);
    // Optional: Update store immediately? Or wait for confirmation?
    // Let's update immediately for live preview inside the popover
    if (editingIndex !== null) {
      updateColor(editingIndex, newColor);
    }
  };

  // Confirms the color change (e.g., button inside popover)
  const confirmColorChange = () => {
    if (editingIndex !== null) {
      // updateColor(editingIndex, pickerColor); // Already updated onChange
      setEditingIndex(null); // Close popover
    }
  };

  // Cancels the color change
  const cancelColorChange = () => {
    // Optionally revert color change if update wasn't immediate
    setEditingIndex(null); // Close popover
  };

  // Ensure we always try to render 12 squares
  const displayColors = colors
    .slice(0, 12)
    .concat(Array(Math.max(0, 12 - colors.length)).fill(null));

  return (
    <div
      className={`relative p-2 rounded-md ${
        isEditing ? "bg-gray-700/50 border border-yellow-500/50" : ""
      } ${className}`}
    >
      {" "}
      {/* Added padding/border in edit mode */}
      <div className="flex justify-between items-center mb-2">
        {/* Make edit state text more prominent */}
        <span
          className={`text-xs font-medium ${
            isEditing ? "text-yellow-400" : "text-gray-400"
          }`}
        >
          {isEditing ? "Editing Palette" : "Select Color"}
        </span>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`p-1 rounded ${
            isEditing
              ? "text-yellow-300 hover:bg-yellow-900/50"
              : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
          }`}
          title={isEditing ? "Finish Editing" : "Edit Palette"}
        >
          {isEditing ? <Check size={14} /> : <Edit2 size={14} />}
        </button>
      </div>
      <div className={`grid grid-cols-6 gap-1 relative w-fit`}>
        {displayColors.map((color, index) => (
          <div
            key={index}
            ref={(el) => (triggerRefs.current[index] = el)} // Store ref for positioning
            onClick={() => handleSquareClick(index, color)}
            className={`w-8 h-8 rounded border 
                       ${
                         color
                           ? "cursor-pointer"
                           : "bg-gray-700 cursor-not-allowed"
                       }
                       ${
                         isEditing && color
                           ? "border-yellow-600 hover:ring-2 hover:ring-offset-1 hover:ring-offset-gray-700 hover:ring-yellow-400"
                           : "border-gray-600"
                       } 
                       ${
                         !isEditing && color
                           ? "hover:ring-2 hover:ring-offset-1 hover:ring-offset-gray-800 hover:ring-blue-400"
                           : ""
                       }
                       ${
                         editingIndex === index
                           ? "ring-2 ring-offset-1 ring-offset-gray-700 ring-yellow-500"
                           : ""
                       } `}
            style={color ? { backgroundColor: color } : {}}
            title={
              isEditing
                ? color
                  ? `Edit: ${color}`
                  : "Empty"
                : color || "Empty slot"
            }
          />
        ))}
      </div>
      {/* Color Picker Popover - Now uses Popper styles */}
      {editingIndex !== null && (
        <div
          ref={popoverRef} // Ref for Popper
          style={popperStyles.popper} // Apply Popper styles
          {...popperAttributes.popper} // Apply Popper attributes
          className="z-[110] p-3 bg-gray-800 rounded-lg shadow-xl border border-gray-600" // Ensure high z-index
        >
          <HexColorPicker color={pickerColor} onChange={handlePickerChange} />
          {/* Simple confirm/cancel, could be improved */}
          {/* <div className="flex justify-end gap-2 mt-2"> */}
          {/*    <button onClick={cancelColorChange} className="p-1 text-xs rounded bg-gray-600 hover:bg-gray-500"><X size={12}/></button> */}
          {/*    <button onClick={confirmColorChange} className="p-1 text-xs rounded bg-blue-600 hover:bg-blue-500"><Check size={12}/></button> */}
          {/* </div> */}
          {/* Removed confirm/cancel - changes apply live, close by clicking outside */}
        </div>
      )}
    </div>
  );
};

export default ColorPalette;
 