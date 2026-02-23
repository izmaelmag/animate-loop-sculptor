export interface AnimationTemplatesApiError {
  code: string;
  message: string;
  details?: string;
}

export type AnimationTemplateRenderer = "p5" | "webgl" | "r3f";

export interface CreateAnimationTemplatePayload {
  name: string;
  renderer: AnimationTemplateRenderer;
  fps: number;
  durationSeconds: number;
  width: number;
  height: number;
}

export interface CreatedAnimationTemplate {
  animation: {
    id: string;
    name: string;
    renderer: AnimationTemplateRenderer;
  };
  filesCreated: string[];
  error?: AnimationTemplatesApiError;
}

export interface ArchivedAnimationTemplate {
  archived: {
    id: string;
    archivedTo: string;
  };
  filesMoved: string[];
  error?: AnimationTemplatesApiError;
}

export interface CopiedAnimationTemplate {
  animation: {
    id: string;
    name: string;
    renderer: AnimationTemplateRenderer;
  };
  filesCopied: string[];
  error?: AnimationTemplatesApiError;
}

const parseJson = async <T>(response: Response): Promise<T | undefined> => {
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined;
  }
};

const parseApiError = (
  status: number,
  body?: CreatedAnimationTemplate | ArchivedAnimationTemplate | CopiedAnimationTemplate,
): AnimationTemplatesApiError => {
  if (body?.error) {
    return body.error;
  }

  if (status === 404) {
    return {
      code: "API_ROUTE_NOT_FOUND",
      message:
        "API route was not found. Restart dev servers so /api/animations/new is available.",
    };
  }

  return {
    code: `HTTP_${status}`,
    message: `Request failed with status ${status}`,
  };
};

export const createAnimationTemplate = async (
  payload: CreateAnimationTemplatePayload,
): Promise<CreatedAnimationTemplate> => {
  const response = await fetch("/api/animations/new", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });

  const body = await parseJson<CreatedAnimationTemplate>(response);
  if (!response.ok || !body?.animation) {
    throw parseApiError(response.status, body);
  }

  return body;
};

export const archiveAnimationTemplate = async (payload: {
  id: string;
}): Promise<ArchivedAnimationTemplate> => {
  const response = await fetch("/api/animations/archive", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });

  const body = await parseJson<ArchivedAnimationTemplate>(response);
  if (!response.ok || !body?.archived) {
    throw parseApiError(response.status, body);
  }

  return body;
};

export const copyAnimationTemplate = async (payload: {
  id: string;
  name?: string;
}): Promise<CopiedAnimationTemplate> => {
  const response = await fetch("/api/animations/copy", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });

  const body = await parseJson<CopiedAnimationTemplate>(response);
  if (!response.ok || !body?.animation) {
    throw parseApiError(response.status, body);
  }

  return body;
};
