export type RenderQuality = "high" | "medium" | "low";
export type RenderStatus = "queued" | "running" | "success" | "error" | "cancelled";

export interface RenderApiError {
  code: string;
  message: string;
  details?: string;
}

export interface RenderJob {
  id: string;
  templateId: string;
  quality: RenderQuality;
  status: RenderStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  outputFile: string | null;
  outputPath: string | null;
  outputUrl: string | null;
  error: RenderApiError | null;
}

interface ApiResponse<T> {
  job?: T;
  error?: RenderApiError;
}

const parseApiError = (status: number, body?: ApiResponse<RenderJob>): RenderApiError => {
  if (body?.error) {
    return body.error;
  }

  return {
    code: `HTTP_${status}`,
    message: `Request failed with status ${status}`,
  };
};

const parseJson = async <T>(response: Response): Promise<T | undefined> => {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined;
  }
};

export const startRender = async (payload: {
  templateId: string;
  quality: RenderQuality;
  animationParams?: Record<string, unknown>;
}): Promise<RenderJob> => {
  const response = await fetch("/api/renders", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });

  const body = await parseJson<ApiResponse<RenderJob>>(response);
  if (!response.ok || !body?.job) {
    throw parseApiError(response.status, body);
  }

  return body.job;
};

export const getRenderStatus = async (id: string): Promise<RenderJob> => {
  const response = await fetch(`/api/renders/${id}`);
  const body = await parseJson<ApiResponse<RenderJob>>(response);

  if (!response.ok || !body?.job) {
    throw parseApiError(response.status, body);
  }

  return body.job;
};

export const cancelRender = async (id: string): Promise<RenderJob> => {
  const response = await fetch(`/api/renders/${id}`, {method: "DELETE"});
  const body = await parseJson<ApiResponse<RenderJob>>(response);

  if (!response.ok || !body?.job) {
    throw parseApiError(response.status, body);
  }

  return body.job;
};
