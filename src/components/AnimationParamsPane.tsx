import { useEffect, useMemo, useRef } from "react";
import { Pane } from "tweakpane";
import { animationSettings, defaultAnimation } from "@/animations";
import { useAnimationStore } from "@/stores/animationStore";

const AnimationParamsPane = () => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const selectedAnimationId = useAnimationStore((s) => s.selectedAnimationId);
  const getParamsForAnimation = useAnimationStore((s) => s.getParamsForAnimation);
  const setAnimationParams = useAnimationStore((s) => s.setAnimationParams);
  const patchAnimationParams = useAnimationStore((s) => s.patchAnimationParams);
  const resetAnimationParams = useAnimationStore((s) => s.resetAnimationParams);

  const settings = useMemo(
    () => animationSettings[selectedAnimationId] || defaultAnimation,
    [selectedAnimationId],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    host.innerHTML = "";

    if (!settings.createParamsPane) {
      return;
    }

    const pane = new Pane({
      container: host,
      title: "Parameters",
      expanded: true,
    });

    const params = getParamsForAnimation(selectedAnimationId);
    const cleanup = settings.createParamsPane({
      pane,
      params,
      setParams: (next) => setAnimationParams(selectedAnimationId, next),
      patchParams: (patch) => patchAnimationParams(selectedAnimationId, patch),
      resetParams: () => resetAnimationParams(selectedAnimationId),
    });

    return () => {
      if (typeof cleanup === "function") {
        cleanup();
      }
      pane.dispose();
      host.innerHTML = "";
    };
  }, [
    selectedAnimationId,
    settings,
    getParamsForAnimation,
    patchAnimationParams,
    resetAnimationParams,
    setAnimationParams,
  ]);

  if (!settings.createParamsPane) {
    return null;
  }

  return (
    <div className="p-4 border-t border-neutral-800 overflow-y-auto max-h-[40vh]">
      <div ref={hostRef} className="tweakpane-host" />
    </div>
  );
};

export default AnimationParamsPane;
