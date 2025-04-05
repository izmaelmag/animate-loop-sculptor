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
import { useCallback, useMemo } from "react";

interface SettingsPanelProps {
  isEnabled?: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isEnabled = true }) => {
  const { selectedAnimation: selectedAnimationId, setSelectedAnimation: setSelectedAnimationId } = useAnimationStore();

  const animationOptions = useMemo(() => {
    return Object.entries(animationSettings).map(([key, settings]) => ({
      id: settings.id,
      name: settings.name,
      key
    }));
  }, []);

  const handleAnimationChange = useCallback(
    (animationId: string) => setSelectedAnimationId(animationId),
    [setSelectedAnimationId]
  );

  // Find the display name for the selected animation
  const selectedName = useMemo(() => {
    const animation = Object.values(animationSettings).find(
      settings => settings.id === selectedAnimationId
    );
    return animation?.name || selectedAnimationId;
  }, [selectedAnimationId]);

  return (
    <div className="flex flex-col gap-4">
      <Panel disabled={!isEnabled}>
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-white/70">Animation</h3>

            <Select
              value={selectedAnimationId}
              onValueChange={handleAnimationChange}
              disabled={!isEnabled}
            >
              <SelectTrigger
                id="animation-select"
                className="w-full bg-black border-gray-700 cursor-pointer"
              >
                <SelectValue placeholder="Select animation">{selectedName}</SelectValue>
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
        </div>
      </Panel>
    </div>
  );
};

export default SettingsPanel;
