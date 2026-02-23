import { useEffect, useMemo, useState } from "react";
import { animationSettings } from "../animations";
import { useAnimationStore } from "../stores/animationStore";
import { NotebookPen, X } from "lucide-react";

const getNotesStorageKey = (animationId: string): string => {
  return `animation-notes:${animationId}`;
};

interface AnimationNotesButtonProps {
  iconOnly?: boolean;
  className?: string;
}

const AnimationNotesButton = ({
  iconOnly = false,
  className = "",
}: AnimationNotesButtonProps) => {
  const selectedAnimationId = useAnimationStore((s) => s.selectedAnimationId);
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");

  const selectedAnimationName = useMemo(() => {
    return animationSettings[selectedAnimationId]?.name ?? selectedAnimationId;
  }, [selectedAnimationId]);

  const storageKey = useMemo(() => {
    return getNotesStorageKey(selectedAnimationId);
  }, [selectedAnimationId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const saved = window.localStorage.getItem(storageKey) ?? "";
    setText(saved);
  }, [storageKey]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const onTextChange = (next: string): void => {
    setText(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, next);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open notes"
        title="Notes"
        className={
          iconOnly
            ? `h-9 w-9 inline-flex items-center justify-center rounded border border-neutral-700 text-white/90 hover:bg-neutral-800 transition-colors ${className}`
            : `w-full px-3 py-2 rounded border border-neutral-700 text-sm text-white/90 hover:bg-neutral-800 transition-colors inline-flex items-center justify-center gap-2 ${className}`
        }
      >
        <NotebookPen size={16} />
        {iconOnly ? null : <span>Notes</span>}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[99999] bg-black/70 p-4 flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-3xl max-h-[85vh] bg-neutral-900 border border-white/20 rounded-xl p-4 flex flex-col gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-white truncate">
                Notes: {selectedAnimationName}
              </div>
              <button
                type="button"
                aria-label="Close notes"
                title="Close"
                className="h-8 w-8 inline-flex items-center justify-center rounded border border-white/20 text-white/90 hover:bg-neutral-800 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <X size={14} />
              </button>
            </div>

            <textarea
              value={text}
              onChange={(event) => onTextChange(event.target.value)}
              placeholder="Write notes for this animation..."
              spellCheck={false}
              rows={16}
              className="w-full min-h-[240px] max-h-[65vh] resize-y rounded-md border border-white/20 bg-black text-white p-3 text-sm font-mono leading-6"
            />

            <div className="text-xs text-white/60">
              Autosave enabled. Stored by animation id in localStorage.
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default AnimationNotesButton;
