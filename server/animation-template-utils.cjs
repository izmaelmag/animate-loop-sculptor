const REGISTRY_UPDATE_FAILED = "REGISTRY_UPDATE_FAILED";
const MAX_ANIMATION_NAME_LENGTH = 80;
const SUPPORTED_TEMPLATE_RENDERERS = ["p5", "webgl", "r3f"];
const ARCHIVE_DIR_NAME = "archive";
const DEFAULT_TEMPLATE_CONFIG = {
  fps: 30,
  durationSeconds: 8,
  width: 1080,
  height: 1920,
};
const RENDERER_EMOJI = {
  p5: "🎨",
  webgl: "🧪",
  r3f: "🧊",
};

const createRegistryUpdateError = (message) => {
  const err = new Error(message);
  err.code = REGISTRY_UPDATE_FAILED;
  return err;
};

const normalizeAnimationNameInput = (rawName) => {
  return typeof rawName === "string" ? rawName.trim() : "";
};

const validateAnimationNameInput = (rawName) => {
  const name = normalizeAnimationNameInput(rawName);

  if (!name) {
    return {
      ok: false,
      code: "INVALID_NAME",
      message: "Field \"name\" is required.",
    };
  }

  if (name.length > MAX_ANIMATION_NAME_LENGTH) {
    return {
      ok: false,
      code: "INVALID_NAME",
      message: `Animation name must be ${MAX_ANIMATION_NAME_LENGTH} characters or fewer.`,
    };
  }

  return {ok: true, name};
};

const validateRendererInput = (rawRenderer) => {
  const fallbackRenderer = "p5";
  const renderer =
    typeof rawRenderer === "string" && rawRenderer.trim()
      ? rawRenderer.trim().toLowerCase()
      : fallbackRenderer;

  if (!SUPPORTED_TEMPLATE_RENDERERS.includes(renderer)) {
    return {
      ok: false,
      code: "INVALID_RENDERER",
      message: `Renderer must be one of: ${SUPPORTED_TEMPLATE_RENDERERS.join(", ")}.`,
    };
  }

  return {ok: true, renderer};
};

const toPositiveInt = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.floor(parsed);
};

const validateTemplateConfigInput = (rawConfig) => {
  const fps = toPositiveInt(rawConfig?.fps, DEFAULT_TEMPLATE_CONFIG.fps);
  const durationSeconds = toPositiveInt(
    rawConfig?.durationSeconds,
    DEFAULT_TEMPLATE_CONFIG.durationSeconds,
  );
  const width = toPositiveInt(rawConfig?.width, DEFAULT_TEMPLATE_CONFIG.width);
  const height = toPositiveInt(rawConfig?.height, DEFAULT_TEMPLATE_CONFIG.height);

  if (fps < 1 || fps > 240) {
    return {
      ok: false,
      code: "INVALID_TEMPLATE_CONFIG",
      message: "FPS must be between 1 and 240.",
    };
  }

  if (durationSeconds < 1 || durationSeconds > 600) {
    return {
      ok: false,
      code: "INVALID_TEMPLATE_CONFIG",
      message: "Duration must be between 1 and 600 seconds.",
    };
  }

  if (width < 64 || width > 8192 || height < 64 || height > 8192) {
    return {
      ok: false,
      code: "INVALID_TEMPLATE_CONFIG",
      message: "Width and height must be between 64 and 8192 px.",
    };
  }

  return {
    ok: true,
    config: {fps, durationSeconds, width, height},
  };
};

const toAnimationId = (name) => {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const toAnimationAlias = (id) => {
  const base = String(id || "")
    .split(/[^a-zA-Z0-9]/)
    .filter(Boolean)
    .map((part, index) => {
      if (index === 0) return part.toLowerCase();
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join("");

  const alias = `${base}Animation`;
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(alias)
    ? alias
    : "generatedAnimation";
};

const renderTemplate = (templateSource, variables) => {
  return Object.entries(variables).reduce((output, [key, value]) => {
    const token = `{{${key}}}`;
    return output.split(token).join(String(value));
  }, templateSource);
};

const getAnimationDisplayName = (renderer, name) => {
  const emoji = RENDERER_EMOJI[renderer] || "🎬";
  return `${emoji} ${name}`;
};

const createAnimationTemplateSource = ({templateSource, renderer, name, id}) => {
  return renderTemplate(templateSource, {
    idLiteral: JSON.stringify(id),
    nameLiteral: JSON.stringify(name),
    displayNameLiteral: JSON.stringify(getAnimationDisplayName(renderer, name)),
    durationSecondsLiteral: String(DEFAULT_TEMPLATE_CONFIG.durationSeconds),
    widthLiteral: String(DEFAULT_TEMPLATE_CONFIG.width),
    heightLiteral: String(DEFAULT_TEMPLATE_CONFIG.height),
  });
};

const createAnimationTemplateSourceWithConfig = ({
  templateSource,
  renderer,
  name,
  id,
  config,
}) => {
  return renderTemplate(templateSource, {
    idLiteral: JSON.stringify(id),
    nameLiteral: JSON.stringify(name),
    displayNameLiteral: JSON.stringify(getAnimationDisplayName(renderer, name)),
    fpsLiteral: String(config.fps),
    durationSecondsLiteral: String(config.durationSeconds),
    widthLiteral: String(config.width),
    heightLiteral: String(config.height),
  });
};

const updateAnimationRegistrySource = ({source, id, alias}) => {
  const importLine = `import { settings as ${alias} } from "./${id}";`;
  const exportLine = `export { settings as ${alias} } from "./${id}";`;
  const settingsLine = `  [${alias}.id]: ${alias},`;

  let next = source;

  if (!next.includes(importLine)) {
    const importMatches = [
      ...next.matchAll(/^import { settings as [^}]+ } from "\.\/[^"]+";$/gm),
    ];
    if (importMatches.length === 0) {
      throw createRegistryUpdateError(
        "Unable to locate settings import block in animations registry.",
      );
    }
    const lastImport = importMatches[importMatches.length - 1];
    const insertionIndex = lastImport.index + lastImport[0].length;
    next = `${next.slice(0, insertionIndex)}\n${importLine}${next.slice(insertionIndex)}`;
  }

  if (!next.includes(exportLine)) {
    const exportMatches = [
      ...next.matchAll(/^export { settings as [^}]+ } from "\.\/[^"]+";$/gm),
    ];
    if (exportMatches.length === 0) {
      throw createRegistryUpdateError(
        "Unable to locate settings export block in animations registry.",
      );
    }
    const lastExport = exportMatches[exportMatches.length - 1];
    const insertionIndex = lastExport.index + lastExport[0].length;
    next = `${next.slice(0, insertionIndex)}\n${exportLine}${next.slice(insertionIndex)}`;
  }

  if (!next.includes(settingsLine)) {
    const settingsStartMarker =
      "export const animationSettings: Record<string, AnimationSettings> = {";
    const settingsStart = next.indexOf(settingsStartMarker);
    if (settingsStart === -1) {
      throw createRegistryUpdateError(
        "Unable to locate animationSettings object in animations registry.",
      );
    }

    const settingsEnd = next.indexOf("\n};", settingsStart);
    if (settingsEnd === -1) {
      throw createRegistryUpdateError(
        "Unable to locate end of animationSettings object.",
      );
    }

    next = `${next.slice(0, settingsEnd)}\n${settingsLine}${next.slice(settingsEnd)}`;
  }

  return next;
};

const removeAnimationFromRegistrySource = ({source, id, alias}) => {
  const importLine = `import { settings as ${alias} } from "./${id}";`;
  const exportLine = `export { settings as ${alias} } from "./${id}";`;
  const settingsLine = `  [${alias}.id]: ${alias},`;

  let next = source;
  if (!next.includes(importLine) && !next.includes(exportLine) && !next.includes(settingsLine)) {
    const err = new Error(`Animation "${id}" is not registered in animations index.`);
    err.code = "ANIMATION_NOT_REGISTERED";
    throw err;
  }

  next = next.replace(`${importLine}\n`, "");
  next = next.replace(`${exportLine}\n`, "");
  next = next.replace(`${settingsLine}\n`, "");

  return next;
};

const getDefaultAnimationIdFromRegistrySource = (source) => {
  const match = source.match(
    /^export { settings as defaultAnimation } from "\.\/([^"]+)";$/m,
  );
  return match ? match[1] : null;
};

const buildArchiveFolderName = ({id, timestamp = Date.now()}) => {
  return `${timestamp}-${id}`;
};

module.exports = {
  MAX_ANIMATION_NAME_LENGTH,
  REGISTRY_UPDATE_FAILED,
  ARCHIVE_DIR_NAME,
  DEFAULT_TEMPLATE_CONFIG,
  SUPPORTED_TEMPLATE_RENDERERS,
  RENDERER_EMOJI,
  normalizeAnimationNameInput,
  validateAnimationNameInput,
  validateRendererInput,
  validateTemplateConfigInput,
  toAnimationId,
  toAnimationAlias,
  renderTemplate,
  getAnimationDisplayName,
  createAnimationTemplateSource,
  createAnimationTemplateSourceWithConfig,
  updateAnimationRegistrySource,
  removeAnimationFromRegistrySource,
  getDefaultAnimationIdFromRegistrySource,
  buildArchiveFolderName,
};
