import { AnimationParamsPaneContext } from "../../types/animations";
import {
  defaultParams,
  resolveDynamicStripesParams,
  DynamicStripesParams,
} from "./settings";

interface DslPreset {
  title: string;
  textDsl: string;
  colorDsl: string;
}

const DSL_PRESETS: DslPreset[] = [
  {
    title: "Mono",
    textDsl: "[SCULPTOR]",
    colorDsl: "[#ffffff]",
  },
  {
    title: "Alt Segments",
    textDsl: "[HELLO,WORLD]",
    colorDsl: "[#ffbc00,#00ffff]",
  },
  {
    title: "Per-Line Pair",
    textDsl: "[SCULPTOR,LOOP][ANIMATE,WALL]",
    colorDsl: "[#ffffff,#7dd3fc][#fca5a5,#fef08a]",
  },
  {
    title: "Rainbow",
    textDsl: "[SCULPTOR,ANIMATE,LOOP,SCENE]",
    colorDsl: "[#ff006e,#fb5607,#ffbe0b,#8338ec,#3a86ff]",
  },
  {
    title: "Binary",
    textDsl: "[01,10,00,11]",
    colorDsl: "[#22c55e,#0f172a]",
  },
];

const sanitizeDslToken = (value: string): string => {
  return value.replace(/\[/g, "(").replace(/\]/g, ")");
};

const toSingleLineDsl = (value: string): string => {
  return `[${sanitizeDslToken(value.trim())}]`;
};

export const createDynamicStripesParamsPane = ({
  pane,
  params,
  patchParams,
  resetParams,
}: AnimationParamsPaneContext): void => {
  const model: DynamicStripesParams = resolveDynamicStripesParams(params);
  const applyPatchAndRefresh = (patch: Partial<DynamicStripesParams>): void => {
    Object.assign(model, patch);
    patchParams(patch);
    pane.refresh();
  };

  const appearanceFolder = pane.addFolder({
    title: "Appearance",
    expanded: true,
  });
  appearanceFolder
    .addBinding(model, "backgroundColor", {
      view: "color",
      label: "Background",
    })
    .on("change", (ev) => patchParams({ backgroundColor: ev.value }));
  appearanceFolder
    .addBinding(model, "segmentColor", {
      view: "color",
      label: "Segments",
    })
    .on("change", (ev) => patchParams({ segmentColor: ev.value }));
  appearanceFolder
    .addBinding(model, "segmentText", {
      label: "Text",
    })
    .on("change", (ev) => patchParams({ segmentText: ev.value }));
  appearanceFolder
    .addBinding(model, "lineThickness", {
      min: 1,
      max: 265,
      step: 1,
      label: "Width",
    })
    .on("change", (ev) => patchParams({ lineThickness: ev.value }));
  appearanceFolder
    .addBinding(model, "strokeCap", {
      label: "Cap",
      options: {
        Round: "round",
        Square: "square",
        Project: "project",
      },
    })
    .on("change", (ev) => patchParams({ strokeCap: ev.value }));

  const dslFolder = pane.addFolder({
    title: "DSL Mapping",
    expanded: true,
  });
  dslFolder
    .addBinding(model, "segmentTextNotation", {
      label: "Text DSL",
    })
    .on("change", (ev) => patchParams({ segmentTextNotation: ev.value }));
  dslFolder
    .addBinding(model, "segmentColorNotation", {
      label: "Color DSL",
    })
    .on("change", (ev) => patchParams({ segmentColorNotation: ev.value }));

  const applyDslPreset = (preset: DslPreset): void => {
    applyPatchAndRefresh({
      segmentTextNotation: preset.textDsl,
      segmentColorNotation: preset.colorDsl,
    });
  };

  const applyDslFromCurrent = (): void => {
    const textDsl = toSingleLineDsl(model.segmentText);
    const colorDsl = toSingleLineDsl(model.segmentColor);
    applyPatchAndRefresh({
      segmentTextNotation: textDsl,
      segmentColorNotation: colorDsl,
    });
  };

  dslFolder.addButton({ title: "From current Text/Color" }).on("click", () => {
    applyDslFromCurrent();
  });

  const dslPresetsFolder = dslFolder.addFolder({
    title: "DSL Presets",
    expanded: false,
  });
  DSL_PRESETS.forEach((preset) => {
    dslPresetsFolder.addButton({ title: preset.title }).on("click", () => {
      applyDslPreset(preset);
    });
  });

  const geometryFolder = pane.addFolder({
    title: "Geometry",
    expanded: false,
  });
  geometryFolder
    .addBinding(model, "margin", {
      min: -1920,
      max: 2000,
      step: 1,
      label: "Margin",
    })
    .on("change", (ev) => patchParams({ margin: ev.value }));
  geometryFolder
    .addBinding(model, "edgeDivisions", {
      min: 1,
      max: 256,
      step: 1,
      label: "Lines",
    })
    .on("change", (ev) => patchParams({ edgeDivisions: ev.value }));
  geometryFolder
    .addBinding(model, "lineAngleDeg", {
      min: 0,
      max: 360,
      step: 1,
      label: "Angle",
    })
    .on("change", (ev) => patchParams({ lineAngleDeg: ev.value }));
  geometryFolder
    .addBinding(model, "lineLengthPx", {
      min: 50,
      max: 6000,
      step: 1,
      label: "Length",
    })
    .on("change", (ev) => patchParams({ lineLengthPx: ev.value }));

  const segmentsFolder = pane.addFolder({
    title: "Segments",
    expanded: true,
  });
  segmentsFolder
    .addBinding(model, "segmentCount", {
      min: 2,
      max: 24,
      step: 1,
      label: "Segs",
    })
    .on("change", (ev) => patchParams({ segmentCount: ev.value }));
  segmentsFolder
    .addBinding(model, "segmentGap", {
      min: 0,
      max: 1024,
      step: 1,
      label: "Gap",
    })
    .on("change", (ev) => patchParams({ segmentGap: ev.value }));
  segmentsFolder
    .addBinding(model, "minSegmentLengthPx", {
      min: 0,
      max: 256,
      step: 1,
      label: "Min Seg",
    })
    .on("change", (ev) => patchParams({ minSegmentLengthPx: ev.value }));
  segmentsFolder
    .addBinding(model, "strictGap", {
      label: "Strict Gap",
    })
    .on("change", (ev) => patchParams({ strictGap: ev.value }));

  const motionFolder = pane.addFolder({
    title: "Motion",
    expanded: true,
  });
  motionFolder
    .addBinding(model, "speed", {
      min: 1,
      max: 20,
      step: 1,
      label: "Cycles",
    })
    .on("change", (ev) => patchParams({ speed: ev.value }));
  motionFolder
    .addBinding(model, "originCycles", {
      min: 0,
      max: 20,
      step: 1,
      label: "Drift C",
    })
    .on("change", (ev) => patchParams({ originCycles: ev.value }));
  motionFolder
    .addBinding(model, "originDirection", {
      label: "Drift D",
      options: {
        Forward: "forward",
        Backward: "backward",
      },
    })
    .on("change", (ev) => patchParams({ originDirection: ev.value }));
  motionFolder
    .addBinding(model, "waveDirection", {
      label: "Dir",
      options: {
        "TR->BL": "tr-bl",
        "BL->TR": "bl-tr",
      },
    })
    .on("change", (ev) => patchParams({ waveDirection: ev.value }));
  motionFolder
    .addBinding(model, "phaseDelta", {
      min: 0,
      max: Math.PI * 2,
      step: 0.01,
      label: "Phase",
    })
    .on("change", (ev) => patchParams({ phaseDelta: ev.value }));
  motionFolder
    .addBinding(model, "amplitude", {
      min: 0,
      max: 0.2,
      step: 0.001,
      label: "Amplitude",
    })
    .on("change", (ev) => patchParams({ amplitude: ev.value }));

  const utilityFolder = pane.addFolder({
    title: "Utility",
    expanded: false,
  });
  utilityFolder
    .addBinding(model, "debug", {
      label: "Debug",
    })
    .on("change", (ev) => patchParams({ debug: ev.value }));

  utilityFolder.addButton({ title: "Reset Params" }).on("click", () => {
    resetParams();
    Object.assign(model, defaultParams);
    pane.refresh();
  });
};
