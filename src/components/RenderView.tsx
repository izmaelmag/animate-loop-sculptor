
import { useState, useEffect, useCallback } from 'react';
import { Player } from '@remotion/player';
import { Card } from '@/components/ui/card';
import Timeline from './Timeline';
import ExportPanel from './ExportPanel';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { P5Animation } from '@/remotion/P5Animation';
import { defaultSketch } from '@/utils/templates';
import { renderMedia, selectComposition } from "@remotion/renderer";
import { bundle } from "@remotion/bundler";
import path from 'path';
import { useNavigate } from 'react-router-dom';

// Default export settings
const DEFAULT_DURATION = 10;
const DEFAULT_FPS = 60;

const RenderView = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
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
  
  const handleExport = useCallback(async () => {
    setIsRendering(true);
    
    toast({
      title: 'Starting export...',
      description: 'Your video is being prepared for export.',
      duration: 5000,
    });
    
    try {
      // For browser-based rendering, we'll use a workaround
      // In a real-world app, you'd want to use a server-side rendering approach
      
      // Create a temporary download link and trigger it
      const link = document.createElement('a');
      link.href = 'https://remotion.dev/getting-started'; // Placeholder URL
      link.download = `${settings.filename}.mp4`;
      
      // Show a message explaining why the download is not working in the browser
      toast({
        title: 'Export limitation',
        description: 'Video rendering requires a Node.js environment. In a complete implementation, this would send the rendering job to a backend service.',
        duration: 8000,
      });
      
      setTimeout(() => {
        setIsRendering(false);
      }, 2000);
    } catch (error) {
      console.error('Error during export:', error);
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
        duration: 5000,
      });
      setIsRendering(false);
    }
  }, [settings.filename, toast]);
  
  return (
    <div className="flex h-full">
      <div className="w-2/3 content-area flex flex-col items-center justify-center">
        <Card className="p-0 overflow-hidden aspect-[9/16] max-h-[80vh] bg-black animate-fade-in">
          <Player
            component={P5Animation}
            durationInFrames={settings.duration * settings.fps}
            fps={settings.fps}
            compositionWidth={1080}
            compositionHeight={1920}
            style={{ width: '100%', height: '100%' }}
            controls
            loop
            showVolumeControls={false}
            allowFullscreen
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
          
          <Button
            variant="outline"
            className="w-full mb-4"
            onClick={() => navigate('/')}
            disabled={isRendering}
          >
            Back to Sketch Editor
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
