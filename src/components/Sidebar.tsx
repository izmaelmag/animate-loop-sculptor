import { useMemo } from "react";
import { animationSettings } from "@/animations";
import { useAnimationStore } from "@/stores/animationStore";
import { Button } from "@/components/ui/button";
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
        <div className="space-y-2">
          {animationOptions.map((animation) => (
            <Button
              key={animation.key}
              variant={
                selectedAnimationId === animation.id ? "default" : "ghost"
              }
              className={`w-full justify-start text-left ${
                selectedAnimationId === animation.id
                  ? "bg-white text-black hover:bg-white/90"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
              onClick={() => setSelectedAnimationId(animation.id)}
            >
              {animation.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
