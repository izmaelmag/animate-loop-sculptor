import { AnimationParamsPaneContext } from "@/types/animations";
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
    .addBinding(model, "edgeDivisions", {
      min: 1,
      max: 48,
      step: 1,
      label: "Edge Divisions",
    })
    .on("change", (ev) => patchParams({ edgeDivisions: ev.value }));

  pane
    .addBinding(model, "segmentCount", {
      min: 2,
      max: 24,
      step: 1,
      label: "Segments",
    })
    .on("change", (ev) => patchParams({ segmentCount: ev.value }));

  pane
    .addBinding(model, "segmentGap", {
      min: 0,
      max: 200,
      step: 1,
      label: "Gap (px)",
    })
    .on("change", (ev) => patchParams({ segmentGap: ev.value }));

  pane
    .addBinding(model, "lineThickness", {
      min: 1,
      max: 64,
      step: 1,
      label: "Line Thickness",
    })
    .on("change", (ev) => patchParams({ lineThickness: ev.value }));

  pane
    .addBinding(model, "speed", {
      min: 1,
      max: 20,
      step: 1,
      label: "Speed (cycles)",
    })
    .on("change", (ev) => patchParams({ speed: ev.value }));

  pane
    .addBinding(model, "phaseDelta", {
      min: 0,
      max: Math.PI * 2,
      step: 0.01,
      label: "Phase Delta",
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
