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
    .addBinding(model, "segmentCount", {
      min: 2,
      max: 120,
      step: 1,
      label: "Segments",
    })
    .on("change", (ev) => patchParams({ segmentCount: ev.value }));

  pane
    .addBinding(model, "segmentGap", {
      min: 0,
      max: 0.95,
      step: 0.01,
      label: "Gap",
    })
    .on("change", (ev) => patchParams({ segmentGap: ev.value }));

  pane
    .addBinding(model, "speed", {
      min: 0,
      max: 5,
      step: 0.01,
      label: "Speed",
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

  pane.addButton({ title: "Reset Params" }).on("click", () => {
    resetParams();
    Object.assign(model, defaultParams);
    pane.refresh();
  });
};
