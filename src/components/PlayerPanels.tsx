import { useRef, memo, useMemo } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import Timeline from "./Timeline";
import { useIsMobile } from "../hooks/use-mobile";

const STORAGE_KEY = "timeline-player-position";
const PADDING = 20;

// Load initial position from localStorage
const getInitialPosition = (): { x: number; y: number } => {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const savedPos = JSON.parse(saved);
      if (typeof savedPos.x === "number" && typeof savedPos.y === "number") {
        return savedPos;
      }
    }
  } catch (e) {
    console.error("Failed to parse saved position:", e);
  }
  
  return { x: 0, y: 0 };
};

// Memoize to prevent re-renders during animation playback
const DraggablePlayer = memo(() => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(getInitialPosition());
  
  const bounds = useMemo(() => ({
    left: -window.innerWidth / 2 + PADDING,
    right: window.innerWidth / 2 - PADDING,
    top: -window.innerHeight / 2 + PADDING,
    bottom: window.innerHeight / 2 - PADDING,
  }), []);

  const handleDrag = (_e: DraggableEvent, data: DraggableData) => {
    positionRef.current = { x: data.x, y: data.y };
  };

  const handleDragStop = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positionRef.current));
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".drag-handle"
      defaultPosition={positionRef.current}
      onDrag={handleDrag}
      onStop={handleDragStop}
      bounds={bounds}
    >
      <div
        ref={nodeRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50"
      >
        <Timeline />
      </div>
    </Draggable>
  );
});

DraggablePlayer.displayName = "DraggablePlayer";

export default function PlayerPanels() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="w-full flex flex-col gap-2 mt-4">
        <Timeline />
      </div>
    );
  }

  return <DraggablePlayer />;
}
