import Panel from "@/components/ui/panel";
import { animationNames } from "@/animations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAnimationStore } from "@/stores/animationStore";
import { useAnimation } from "@/contexts/AnimationContext";

interface SettingsPanelProps {
  isEnabled?: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isEnabled = true }) => {
  const { setCurrentAnimation } = useAnimation();
  const { selectedAnimation, setSelectedAnimation } = useAnimationStore();

  const handleAnimationChange = (value: string) => {
    setSelectedAnimation(value);
    setCurrentAnimation(value);
  };

  return (
    <div className="flex flex-col gap-4">
      <Panel disabled={!isEnabled}>
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-white/70">Animation</h3>
            <Select
              value={selectedAnimation}
              onValueChange={handleAnimationChange}
              disabled={!isEnabled}
            >
              <SelectTrigger
                id="animation-select"
                className="w-full bg-black border-gray-700 cursor-pointer"
              >
                <SelectValue placeholder="Select animation" />
              </SelectTrigger>
              <SelectContent className="bg-black border-gray-700 text-white">
                {animationNames.map((name) => (
                  <SelectItem
                    key={name}
                    value={name}
                    className="cursor-pointer"
                  >
                    {name.charAt(0).toUpperCase() + name.slice(1)}
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
