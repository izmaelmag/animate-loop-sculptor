import { AnimationParamsPaneContext } from "../../types/animations";
import {
  defaultParams,
  resolveDynamicStripesParams,
  DynamicStripesParams,
} from "./settings";

export const createDynamicStripesParamsPane = ({
  pane,
  params,
  patchParams,
  resetParams,
}: AnimationParamsPaneContext): void => {
  const model: DynamicStripesParams = resolveDynamicStripesParams(params);

  pane
    .addBinding(model, "margin", {
      min: -1920,
      max: 2000,
      step: 1,
      label: "Margin",
    })
    .on("change", (ev) => patchParams({ margin: ev.value }));

  pane
    .addBinding(model, "edgeDivisions", {
      min: 1,
      max: 256,
      step: 1,
      label: "Lines",
    })
    .on("change", (ev) => patchParams({ edgeDivisions: ev.value }));

  pane
    .addBinding(model, "lineAngleDeg", {
      min: 0,
      max: 360,
      step: 1,
      label: "Angle",
    })
    .on("change", (ev) => patchParams({ lineAngleDeg: ev.value }));

  pane
    .addBinding(model, "lineLengthPx", {
      min: 50,
      max: 6000,
      step: 1,
      label: "Length",
    })
    .on("change", (ev) => patchParams({ lineLengthPx: ev.value }));

  pane
    .addBinding(model, "minSegmentLengthPx", {
      min: 0,
      max: 256,
      step: 1,
      label: "Min Seg",
    })
    .on("change", (ev) => patchParams({ minSegmentLengthPx: ev.value }));

  pane
    .addBinding(model, "strictGap", {
      label: "Strict Gap",
    })
    .on("change", (ev) => patchParams({ strictGap: ev.value }));

  pane
    .addBinding(model, "debug", {
      label: "Debug",
    })
    .on("change", (ev) => patchParams({ debug: ev.value }));

  pane
    .addBinding(model, "segmentCount", {
      min: 2,
      max: 24,
      step: 1,
      label: "Segs",
    })
    .on("change", (ev) => patchParams({ segmentCount: ev.value }));

  pane
    .addBinding(model, "segmentGap", {
      min: 0,
      max: 1024,
      step: 1,
      label: "Gap",
    })
    .on("change", (ev) => patchParams({ segmentGap: ev.value }));

  pane
    .addBinding(model, "lineThickness", {
      min: 1,
      max: 265,
      step: 1,
      label: "Width",
    })
    .on("change", (ev) => patchParams({ lineThickness: ev.value }));

  pane
    .addBinding(model, "strokeCap", {
      label: "Cap",
      options: {
        Round: "round",
        Square: "square",
        Project: "project",
      },
    })
    .on("change", (ev) => patchParams({ strokeCap: ev.value }));

  pane
    .addBinding(model, "speed", {
      min: 1,
      max: 20,
      step: 1,
      label: "Cycles",
    })
    .on("change", (ev) => patchParams({ speed: ev.value }));

  pane
    .addBinding(model, "originSpeed", {
      min: -20,
      max: 20,
      step: 1,
      label: "Drift",
    })
    .on("change", (ev) => patchParams({ originSpeed: ev.value }));

  pane
    .addBinding(model, "waveDirection", {
      label: "Dir",
      options: {
        "TR->BL": "tr-bl",
        "BL->TR": "bl-tr",
      },
    })
    .on("change", (ev) => patchParams({ waveDirection: ev.value }));

  pane
    .addBinding(model, "phaseDelta", {
      min: 0,
      max: Math.PI * 2,
      step: 0.01,
      label: "Phase",
    })
    .on("change", (ev) => patchParams({ phaseDelta: ev.value }));

  pane
    .addBinding(model, "amplitude", {
      min: 0,
      max: 0.2,
      step: 0.001,
      label: "Amplitude",
    })
    .on("change", (ev) => patchParams({ amplitude: ev.value }));

  pane.addButton({ title: "Reset Params" }).on("click", () => {
    resetParams();
    Object.assign(model, defaultParams);
    pane.refresh();
  });
};
