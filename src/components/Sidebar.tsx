import { useMemo } from "react";
import { animationSettings } from "@/animations";
import { useAnimationStore } from "@/stores/animationStore";
import { LoaderPinwheel } from "lucide-react";
import RenderControls from "@/components/RenderControls";

const Sidebar = () => {
  const selectedAnimationId = useAnimationStore((s) => s.selectedAnimationId);
  const setSelectedAnimationId = useAnimationStore(
    (s) => s.setSelectedAnimationId,
  );

  const animationOptions = useMemo(
    () =>
      Object.entries(animationSettings).map(([key, s]) => ({
        id: s.id,
        name: s.name,
        key,
      })),
    [],
  );

  return (
    <div className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <LoaderPinwheel size={24} className="text-white" />
          <span className="text-white text-xl font-bold">Sculptor</span>
        </div>
      </div>

      {/* Animations List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {animationOptions.map((animation) => (
            <div
              key={animation.key}
              onClick={() => setSelectedAnimationId(animation.id)}
              className={`
                cursor-pointer transition-colors
                ${
                  selectedAnimationId === animation.id
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                }
              `}
            >
              {animation.name}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-neutral-800">
        <RenderControls />
      </div>
    </div>
  );
};

export default Sidebar;
