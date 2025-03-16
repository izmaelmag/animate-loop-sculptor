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

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isEnabled = true,
}) => {
  const { currentAnimation, setCurrentAnimation } = useAnimation();

  const handleAnimationChange = (value: string) => {
    setCurrentAnimation(value);
  };

  return (
    <Panel disabled={!isEnabled}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Settings</h2>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="animation-select" className="text-sm font-medium">
            Animation
          </label>
          <Select
            value={currentAnimation}
            onValueChange={handleAnimationChange}
            disabled={!isEnabled}
          >
            <SelectTrigger id="animation-select" className="w-full">
              <SelectValue placeholder="Select animation" />
            </SelectTrigger>
            <SelectContent>
              {animationNames.map((name) => (
                <SelectItem key={name} value={name}>
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