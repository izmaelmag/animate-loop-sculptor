import { useMemo } from "react";
import Panel from "@/components/ui/panel";
import { animationSettings } from "@/animations";
import { useAnimationStore } from "@/stores/animationStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RenderControls from "@/components/RenderControls";

const SettingsPanel = () => {
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

  const selectedName = useMemo(() => {
    const animation = Object.values(animationSettings).find(
      (s) => s.id === selectedAnimationId
    );
    return animation?.name || selectedAnimationId;
  }, [selectedAnimationId]);

  return (
    <Panel>
      <div className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-white/70">Animation</h3>
          <Select
            value={selectedAnimationId}
            onValueChange={setSelectedAnimationId}
          >
            <SelectTrigger
              id="animation-select"
              className="w-full bg-black border-gray-700 cursor-pointer"
            >
              <SelectValue placeholder="Select animation">
                {selectedName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-black border-gray-700 text-white">
              {animationOptions.map((animation) => (
                <SelectItem
                  key={animation.key}
                  value={animation.id}
                  className="cursor-pointer"
                >
                  {animation.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="pt-2 border-t border-white/10">
          <RenderControls />
        </div>
      </div>
    </Panel>
  );
};

export default SettingsPanel;
