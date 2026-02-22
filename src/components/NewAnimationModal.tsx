import { useEffect, useMemo, useState } from "react";
import {
  AnimationTemplateRenderer,
  CreateAnimationTemplatePayload,
} from "../api/animationTemplatesApi";

type SizePreset = "9:16" | "1:1" | "16:9" | "custom";
type FpsPreset = "24" | "30" | "60";

interface NewAnimationModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onCreate: (payload: CreateAnimationTemplatePayload) => Promise<void>;
}

const SIZE_PRESETS: Record<Exclude<SizePreset, "custom">, { width: number; height: number }> = {
  "9:16": { width: 1080, height: 1920 },
  "1:1": { width: 1080, height: 1080 },
  "16:9": { width: 1920, height: 1080 },
};

const parsePositiveInt = (value: string, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.floor(parsed));
};

const NewAnimationModal = ({
  isOpen,
  isSubmitting,
  onClose,
  onCreate,
}: NewAnimationModalProps) => {
  const [name, setName] = useState("");
  const [renderer, setRenderer] = useState<AnimationTemplateRenderer>("p5");
  const [fpsPreset, setFpsPreset] = useState<FpsPreset>("30");
  const [durationSeconds, setDurationSeconds] = useState("8");
  const [sizePreset, setSizePreset] = useState<SizePreset>("9:16");
  const [customWidth, setCustomWidth] = useState("1080");
  const [customHeight, setCustomHeight] = useState("1920");

  useEffect(() => {
    if (!isOpen) return;
    setName("");
    setRenderer("p5");
    setFpsPreset("30");
    setDurationSeconds("8");
    setSizePreset("9:16");
    setCustomWidth("1080");
    setCustomHeight("1920");
  }, [isOpen]);

  const resolvedSize = useMemo(() => {
    if (sizePreset === "custom") {
      return {
        width: parsePositiveInt(customWidth, 1080),
        height: parsePositiveInt(customHeight, 1920),
      };
    }
    return SIZE_PRESETS[sizePreset];
  }, [sizePreset, customWidth, customHeight]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-900 p-4 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-white text-base font-semibold">New animation</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white/60 hover:text-white text-sm"
            disabled={isSubmitting}
          >
            Close
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-white/60">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My animation"
            className="w-full rounded border border-neutral-700 bg-black px-3 py-2 text-sm text-white"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-white/60">Type</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "p5", label: "🎨 P5" },
              { id: "webgl", label: "🧪 WebGL" },
              { id: "r3f", label: "🧊 R3F" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setRenderer(option.id as AnimationTemplateRenderer)}
                disabled={isSubmitting}
                className={`rounded border px-2 py-2 text-xs transition-colors ${
                  renderer === option.id
                    ? "border-white/60 text-white bg-neutral-800"
                    : "border-neutral-700 text-white/70 hover:text-white hover:bg-neutral-800"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-white/60">FPS</label>
          <div className="grid grid-cols-3 gap-2">
            {(["24", "30", "60"] as FpsPreset[]).map((fps) => (
              <button
                key={fps}
                type="button"
                onClick={() => setFpsPreset(fps)}
                disabled={isSubmitting}
                className={`rounded border px-2 py-2 text-xs transition-colors ${
                  fpsPreset === fps
                    ? "border-white/60 text-white bg-neutral-800"
                    : "border-neutral-700 text-white/70 hover:text-white hover:bg-neutral-800"
                }`}
              >
                {fps}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-white/60">Duration (seconds)</label>
          <input
            type="number"
            min={1}
            max={600}
            value={durationSeconds}
            onChange={(e) => setDurationSeconds(e.target.value)}
            className="w-full rounded border border-neutral-700 bg-black px-3 py-2 text-sm text-white"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-white/60">Size</label>
          <div className="grid grid-cols-2 gap-2">
            {(["9:16", "1:1", "16:9", "custom"] as SizePreset[]).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setSizePreset(preset)}
                disabled={isSubmitting}
                className={`rounded border px-2 py-2 text-xs transition-colors ${
                  sizePreset === preset
                    ? "border-white/60 text-white bg-neutral-800"
                    : "border-neutral-700 text-white/70 hover:text-white hover:bg-neutral-800"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {sizePreset === "custom" ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-xs text-white/60">Width</label>
              <input
                type="number"
                min={64}
                max={8192}
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                className="w-full rounded border border-neutral-700 bg-black px-3 py-2 text-sm text-white"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/60">Height</label>
              <input
                type="number"
                min={64}
                max={8192}
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                className="w-full rounded border border-neutral-700 bg-black px-3 py-2 text-sm text-white"
                disabled={isSubmitting}
              />
            </div>
          </div>
        ) : null}

        <p className="text-xs text-white/50">
          Final size: {resolvedSize.width}x{resolvedSize.height}
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-neutral-700 px-3 py-2 text-sm text-white/80 hover:bg-neutral-800"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || !name.trim()}
            className="rounded border border-neutral-500 px-3 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-50"
            onClick={() => {
              void onCreate({
                name: name.trim(),
                renderer,
                fps: parsePositiveInt(fpsPreset, 30),
                durationSeconds: parsePositiveInt(durationSeconds, 8),
                width: resolvedSize.width,
                height: resolvedSize.height,
              });
            }}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAnimationModal;
