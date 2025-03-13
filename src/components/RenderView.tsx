
import { useState, useEffect, useCallback } from 'react';
import { Player } from '@remotion/player';
import { Card } from '@/components/ui/card';
import Timeline from './Timeline';
import ExportPanel from './ExportPanel';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { P5Animation } from '@/remotion/P5Animation';
import { useNavigate } from 'react-router-dom';
import { useAnimation } from '@/contexts/AnimationContext';

const RenderView = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { controller } = useAnimation();
  const [isRendering, setIsRendering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [normalizedTime, setNormalizedTime] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [settings, setSettings] = useState({
    duration: 10,
    fps: 60,
    quality: 'high',
    filename: 'animation-export'
  });
  
  // Update settings from controller
  useEffect(() => {
    if (!controller) return;
    
    setSettings(prev => ({
      ...prev,
      duration: controller.duration,
      fps: controller.fps
    }));
    
    // Subscribe to frame changes
    return controller.onFrameChanged((frame, normalized) => {
      setCurrentFrame(frame);
      setNormalizedTime(normalized);
      setCurrentTime(frame / controller.fps);
    });
  }, [controller]);
  
  const handleTimeUpdate = (time: number, normalized: number) => {
    // This is now handled by the controller
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
  
  if (!controller) {
    return <div>Loading render view...</div>;
  }
  
  return (
    <div className="flex h-full">
      <div className="w-2/3 content-area flex flex-col items-center justify-center">
        <div className="relative w-full max-h-[80vh]">
          {/* Frame info overlay */}
          <div className="canvas-frame-info">
            Frame: {currentFrame}/{controller.totalFrames-1}
            <br />
            Normalized Time: {normalizedTime.toFixed(4)}
          </div>
          
          {/* Canvas container with border */}
          <Card className="p-0 overflow-hidden aspect-[9/16] w-full canvas-container">
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
                sketch: controller.sketchCode,
                normalizedTime,
              }}
            />
          </Card>
        </div>
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
          isPlayable={!isRendering}
        />
        
        <div className="mt-4 p-3 bg-zinc-800 rounded-md text-gray-200 text-xs">
          <p className="font-semibold">Frame-by-Frame Mode</p>
          <p>Each frame is rendered independently to prevent flickering</p>
          <p>When exporting, every frame will be rendered exactly as shown in preview</p>
        </div>
      </div>
    </div>
  );
};

export default RenderView;
