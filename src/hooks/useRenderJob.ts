import {useCallback, useEffect, useRef, useState} from "react";
import {
  cancelRender,
  getRenderStatus,
  RenderApiError,
  RenderJob,
  RenderQuality,
  startRender,
} from "@/api/renderApi";

const POLL_INTERVAL_MS = 800;

const isTerminalStatus = (status: RenderJob["status"]) =>
  status === "success" || status === "error" || status === "cancelled";

export const useRenderJob = () => {
  const [job, setJob] = useState<RenderJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<RenderApiError | null>(null);
  const pollTimerRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current !== null) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(
    async (jobId: string) => {
      try {
        const nextJob = await getRenderStatus(jobId);
        setJob(nextJob);
        if (isTerminalStatus(nextJob.status)) {
          stopPolling();
        }
      } catch (error) {
        stopPolling();
        setApiError(error as RenderApiError);
      }
    },
    [stopPolling],
  );

  const beginPolling = useCallback(
    (jobId: string) => {
      stopPolling();
      pollTimerRef.current = window.setInterval(() => {
        void pollStatus(jobId);
      }, POLL_INTERVAL_MS);
    },
    [pollStatus, stopPolling],
  );

  const start = useCallback(
    async (
      templateId: string,
      quality: RenderQuality,
      animationParams?: Record<string, unknown>,
    ) => {
      setIsSubmitting(true);
      setApiError(null);

      try {
        const nextJob = await startRender({templateId, quality, animationParams});
        setJob(nextJob);
        beginPolling(nextJob.id);
        return nextJob;
      } catch (error) {
        setApiError(error as RenderApiError);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [beginPolling],
  );

  const cancel = useCallback(async () => {
    if (!job) return;
    setApiError(null);

    try {
      const nextJob = await cancelRender(job.id);
      setJob(nextJob);
      stopPolling();
      return nextJob;
    } catch (error) {
      setApiError(error as RenderApiError);
      throw error;
    }
  }, [job, stopPolling]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return {
    job,
    apiError,
    isSubmitting,
    isRendering: job?.status === "queued" || job?.status === "running",
    start,
    cancel,
  };
};
