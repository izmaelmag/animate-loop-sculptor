import {useEffect, useMemo, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {RenderQuality} from "@/api/renderApi";
import {useRenderJob} from "@/hooks/useRenderJob";
import {useAnimationStore} from "@/stores/animationStore";
import {toast} from "@/hooks/use-toast";

const statusToLabel: Record<string, string> = {
  queued: "Queued",
  running: "Rendering",
  success: "Done",
  error: "Error",
  cancelled: "Cancelled",
};

const RenderControls = () => {
  const selectedAnimationId = useAnimationStore((s) => s.selectedAnimationId);
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
      await start(selectedAnimationId, quality);
    } catch {
      // Error is already captured in hook state and toast effect.
    }
  };

  const canOpenFile = Boolean(job?.outputUrl && job?.status === "success");

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
        <Select
          value={quality}
          onValueChange={(value) => setQuality(value as RenderQuality)}
          disabled={isRendering}
        >
          <SelectTrigger className="w-[130px] bg-black border-gray-700 cursor-pointer">
            <SelectValue placeholder="Quality" />
          </SelectTrigger>
          <SelectContent className="bg-black border-gray-700 text-white">
            <SelectItem value="high" className="cursor-pointer">
              High
            </SelectItem>
            <SelectItem value="medium" className="cursor-pointer">
              Medium
            </SelectItem>
            <SelectItem value="low" className="cursor-pointer">
              Low
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          size="sm"
          onClick={handleRender}
          disabled={isRendering || isSubmitting}
          className="bg-white text-black hover:bg-white/90"
        >
          {isRendering ? "Rendering..." : "Render"}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            void cancel();
          }}
          disabled={!isRendering}
          className="text-white/80 hover:bg-white/15"
        >
          Cancel
        </Button>
      </div>

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
