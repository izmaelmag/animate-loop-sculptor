import { useEffect, useMemo, useRef } from "react";
import { Pane } from "tweakpane";
import { animationSettings, defaultAnimation } from "../animations";
import { useAnimationStore } from "../stores/animationStore";

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
    <div className="fixed top-4 right-4 z-40 w-[340px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl border border-neutral-700/80 bg-neutral-900/95 shadow-2xl backdrop-blur-sm p-2">
      <div ref={hostRef} className="tweakpane-host" />
    </div>
  );
};

export default AnimationParamsPane;
