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
import { useCallback, useMemo, useRef } from "react";
import { useAnimation } from "@/contexts";

interface SettingsPanelProps {
  isEnabled?: boolean;
  setAudioSrc?: (src: string | null) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isEnabled = true, setAudioSrc }) => {
  const { selectedAnimation: selectedAnimationId, setSelectedAnimation: setSelectedAnimationId } = useAnimationStore();
  const { controller } = useAnimation();
  const audioInputRef = useRef<HTMLInputElement>(null);

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

  const selectedName = useMemo(() => {
    const animation = Object.values(animationSettings).find(
      settings => settings.id === selectedAnimationId
    );
    return animation?.name || selectedAnimationId;
  }, [selectedAnimationId]);

  const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && controller && setAudioSrc) {
        const url = URL.createObjectURL(file);
        console.log("SettingsPanel: Loading audio", url);
        setAudioSrc(url);
        
        controller.currentFrame = 0;
        controller.isPlaying = false;
    }
    if (event.target) event.target.value = ''; 
  };

  return (
    <div className="flex flex-col gap-4">
      <input 
            ref={audioInputRef} 
            type="file" 
            accept="audio/*" 
            onChange={handleAudioFileChange}
            style={{ display: 'none' }}
      />
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

          {setAudioSrc && (
             <div className="space-y-1">
                 <h3 className="text-sm font-medium text-white/70">Audio</h3>
                 <button 
                     onClick={() => audioInputRef.current?.click()} 
                     disabled={!isEnabled}
                     className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-sm font-bold py-2 px-4 rounded"
                 >
                     Load Audio for Sync
                 </button>
             </div>
          )}

        </div>
      </Panel>
    </div>
  );
};

export default SettingsPanel;
