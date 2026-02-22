import {useEffect, useMemo, useRef, useState} from "react";
import {Button} from "./ui/button";
import {RenderQuality} from "../api/renderApi";
import {useRenderJob} from "../hooks/useRenderJob";
import {useAnimationStore} from "../stores/animationStore";
import {toast} from "../hooks/use-toast";

const statusToLabel: Record<string, string> = {
  queued: "Queued",
  running: "Rendering",
  success: "Done",
  error: "Error",
  cancelled: "Cancelled",
};

const RenderControls = () => {
  const selectedAnimationId = useAnimationStore((s) => s.selectedAnimationId);
  const getParamsForAnimation = useAnimationStore((s) => s.getParamsForAnimation);
  const {job, isRendering, isSubmitting, apiError, start, cancel} = useRenderJob();
  const [quality, setQuality] = useState<RenderQuality>("high");
  const progressToastRef = useRef<ReturnType<typeof toast> | null>(null);
  const lastStatusRef = useRef<string | null>(null);

  const percent = useMemo(() => {
    if (!job) return 0;
    return Math.max(0, Math.min(100, Math.round(job.progress)));
  }, [job]);

  const statusLabel = job ? statusToLabel[job.status] ?? job.status : "Idle";

  const handleRender = async () => {
    try {
      const animationParams = getParamsForAnimation(selectedAnimationId);
      await start(selectedAnimationId, quality, animationParams);
    } catch {
      // Error is already captured in hook state and toast effect.
    }
  };

  const canOpenFile = Boolean(job?.outputUrl && job?.status === "success");
  const qualityOptions: Array<{label: string; value: RenderQuality}> = [
    {label: "High", value: "high"},
    {label: "Medium", value: "medium"},
    {label: "Low", value: "low"},
  ];

  useEffect(() => {
    if (!job) {
      return;
    }

    if (job.status === "queued" || job.status === "running") {
      if (!progressToastRef.current) {
        progressToastRef.current = toast({
          title: "Video render started",
          description: `${job.templateId} · ${job.quality.toUpperCase()} · ${percent}%`,
        });
      } else {
        progressToastRef.current.update({
          id: progressToastRef.current.id,
          title: "Rendering in progress",
          description: `${job.templateId} · ${job.quality.toUpperCase()} · ${percent}%`,
        });
      }
    }

    if (job.status !== lastStatusRef.current && job.status === "success") {
      progressToastRef.current?.update({
        id: progressToastRef.current.id,
        title: "Render complete",
        description: job.outputFile ?? "Output file is ready.",
      });
      progressToastRef.current = null;
    }

    if (job.status !== lastStatusRef.current && job.status === "cancelled") {
      progressToastRef.current?.update({
        id: progressToastRef.current.id,
        title: "Render cancelled",
        description: "Rendering was stopped by user request.",
      });
      progressToastRef.current = null;
    }

    if (job.status !== lastStatusRef.current && job.status === "error") {
      progressToastRef.current?.update({
        id: progressToastRef.current.id,
        title: "Render failed",
        description: job.error?.message ?? "Unknown rendering error.",
      });
      progressToastRef.current = null;
    }

    lastStatusRef.current = job.status;
  }, [job, percent]);

  useEffect(() => {
    if (!apiError) return;
    toast({
      title: "Render request failed",
      description: `${apiError.code}: ${apiError.message}`,
    });
  }, [apiError]);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-white/70">Render Video</h3>
      <div className="flex items-center gap-2">
        {qualityOptions.map((option) => {
          const isActive = quality === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setQuality(option.value)}
              disabled={isRendering}
              className={[
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                isActive
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white/70 border-white/30 hover:border-white/60 hover:text-white",
                isRendering ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <Button
        size="sm"
        onClick={() => {
          if (isRendering) {
            void cancel();
            return;
          }
          void handleRender();
        }}
        disabled={isSubmitting}
        className={[
          "w-full bg-transparent text-white border border-neutral-700",
          "hover:bg-white/5 hover:border-neutral-500",
          "disabled:opacity-50",
        ].join(" ")}
      >
        {isRendering ? "Cancel" : "Render"}
      </Button>

      {isRendering ? (
        <div className="space-y-1">
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-white/80 transition-all"
              style={{width: `${percent}%`}}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>{statusLabel}</span>
            <span>{percent}%</span>
          </div>
        </div>
      ) : null}

      {canOpenFile ? (
        <a
          href={job?.outputUrl ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-white/70 hover:text-white underline"
        >
          Open rendered file
        </a>
      ) : null}

      {apiError ? (
        <p className="text-xs text-red-400">
          {apiError.code}: {apiError.message}
        </p>
      ) : null}
    </div>
  );
};

export default RenderControls;
