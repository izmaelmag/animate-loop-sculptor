import React from "react";

interface ColorPaletteProps {
  colors: string[]; // Array of hex color strings (expected length: 12)
  onSelect: (color: string) => void; // Callback function when a color is selected
  className?: string; // Optional additional CSS classes
}

const ColorPalette: React.FC<ColorPaletteProps> = ({
  colors,
  onSelect,
  className = "",
}) => {
  // Ensure we always try to render 12 squares, even if fewer colors are provided
  const displayColors = colors
    .slice(0, 12)
    .concat(Array(Math.max(0, 12 - colors.length)).fill(null));

  return (
    <div className={`grid grid-cols-6 gap-1 ${className} w-fit`}>
      {displayColors.map((color, index) => (
        <div
          key={index}
          onClick={() => color && onSelect(color)} // Only call onSelect if color is not null
          className={`w-8 h-8 rounded border border-gray-600 cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-offset-gray-800 hover:ring-blue-400 ${
            !color ? "bg-gray-700 cursor-not-allowed" : ""
          }`} // Basic styling, adjust as needed
          style={color ? { backgroundColor: color } : {}} // Apply background color if it exists
          title={color || "Empty slot"} // Tooltip
        />
      ))}
    </div>
  );
};

export default ColorPalette;
