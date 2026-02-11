import { useMemo } from "react";
import { animationSettings } from "@/animations";
import { useAnimationStore } from "@/stores/animationStore";
import { LoaderPinwheel } from "lucide-react";

const Sidebar = () => {
  const selectedAnimationId = useAnimationStore((s) => s.selectedAnimationId);
  const setSelectedAnimationId = useAnimationStore(
    (s) => s.setSelectedAnimationId
  );

  const animationOptions = useMemo(
    () =>
      Object.entries(animationSettings).map(([key, s]) => ({
        id: s.id,
        name: s.name,
        key,
      })),
    []
  );

  return (
    <div className="w-64 bg-black border-r border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <LoaderPinwheel size={24} className="text-white" />
          <span className="text-white text-xl font-bold">Sculptor</span>
        </div>
      </div>

      {/* Animations List */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wider">
          Animations
        </h3>
        <div className="space-y-1">
          {animationOptions.map((animation) => (
            <div
              key={animation.key}
              onClick={() => setSelectedAnimationId(animation.id)}
              className={`
                px-3 py-2 rounded cursor-pointer transition-colors
                ${
                  selectedAnimationId === animation.id
                    ? "text-white font-medium bg-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }
              `}
            >
              {animation.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
