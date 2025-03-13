
import { useState, useEffect } from 'react';
import { Player } from '@remotion/player';
import { Card } from '@/components/ui/card';
import Timeline from './Timeline';
import ExportPanel from './ExportPanel';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { P5Animation } from '@/remotion/P5Animation';
import { defaultSketch } from '@/utils/templates';

// Default export settings
const DEFAULT_DURATION = 10;
const DEFAULT_FPS = 60;

const RenderView = () => {
  const { toast } = useToast();
  const [isRendering, setIsRendering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [normalizedTime, setNormalizedTime] = useState(0);
  const [settings, setSettings] = useState({
    duration: DEFAULT_DURATION,
    fps: DEFAULT_FPS,
    quality: 'high',
    filename: 'animation-export'
  });
  
  const handleTimeUpdate = (time: number, normalized: number) => {
    setCurrentTime(time);
    setNormalizedTime(normalized);
  };
  
  const handleSettingsChange = (newSettings: any) => {
    setSettings(newSettings);
  };
  
  const handleExport = () => {
    setIsRendering(true);
    
    toast({
      title: 'Starting export...',
      description: 'Your video is being prepared for export.'
    });
    
    // Simulate rendering process
    setTimeout(() => {
      setIsRendering(false);
      
      toast({
        title: 'Export complete!',
        description: `Your video "${settings.filename}.mp4" has been exported.`,
      });
    }, 3000);
  };
  
  return (
    <div className="flex h-full">
      <div className="w-2/3 content-area flex flex-col items-center justify-center">
        <Card className="p-0 overflow-hidden aspect-reels max-h-[80vh] bg-black animate-fade-in">
          <Player
            component={P5Animation}
            durationInFrames={settings.duration * settings.fps}
            fps={settings.fps}
            compositionWidth={1080}
            compositionHeight={1920}
            style={{ width: '100%', height: '100%' }}
            controls
            loop
            inputProps={{
              sketch: defaultSketch,
              normalizedTime,
            }}
          />
        </Card>
      </div>
      
      <div className="w-1/3 content-area">
        <ExportPanel
          duration={settings.duration}
          fps={settings.fps}
          onSettingsChange={handleSettingsChange}
        />
        
        <div className="mt-4">
          <Button 
            className="w-full mb-4 flex gap-2" 
            onClick={handleExport}
            disabled={isRendering}
          >
            <Download size={16} />
            <span>{isRendering ? 'Rendering...' : 'Export Video'}</span>
          </Button>
        </div>
        
        <Timeline 
          duration={settings.duration} 
          fps={settings.fps} 
          onTimeUpdate={handleTimeUpdate} 
          isPlayable={!isRendering}
        />
      </div>
    </div>
  );
};

export default RenderView;
