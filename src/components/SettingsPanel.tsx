import Panel from "@/components/ui/panel";
import { useAnimation } from "@/contexts/AnimationContext";
import { animationNames } from "@/animations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsPanelProps {
  isEnabled?: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isEnabled = true }) => {
  const { currentAnimation, setCurrentAnimation } = useAnimation();

  const handleAnimationChange = (value: string) => {
    setCurrentAnimation(value);
  };

  return (
    <Panel disabled={!isEnabled}>
      <div className="space-y-4">
        <div className="space-y-1">
          <Select
            value={currentAnimation}
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
                <SelectItem key={name} value={name} className="cursor-pointer">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Panel>
  );
};

export default SettingsPanel;
