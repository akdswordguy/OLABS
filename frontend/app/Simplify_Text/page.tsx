import React from "react";

interface SimplifyTextProps {
  selectedText: string;
  simplifiedText: string;
  hoverPosition: { x: number; y: number };
  isHovering: boolean;
}

const SimplifyText: React.FC<SimplifyTextProps> = ({
  selectedText,
  simplifiedText,
  hoverPosition,
  isHovering,
}) => {
  if (!isHovering || !selectedText) return null;

  return (
    <div
      className="absolute bg-white text-gray-800 p-4 rounded-lg shadow-lg border border-gray-300"
      style={{
        left: hoverPosition.x + "px",
        top: hoverPosition.y + "px",
        zIndex: 1000, // Ensure the tooltip is above other elements
        minWidth: '200px' // Minimum width to prevent narrow boxes
      }}
    >
      <h4 className="font-semibold text-lg mb-1">Selected Text:</h4>
      <p className="mb-2 border-b border-gray-200">{selectedText}</p>
      <h4 className="font-semibold text-lg mb-1">Simplified Text:</h4>
      <p className="text-gray-700">{simplifiedText}</p>
    </div>
  );
};

export default SimplifyText;