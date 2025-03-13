
import { useState, useEffect, useCallback } from 'react';
import { Player } from '@remotion/player';
import { Card } from '@/components/ui/card';
import Timeline from './Timeline';
import ExportPanel from './ExportPanel';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { P5Animation } from '@/remotion/P5Animation';
import { useNavigate } from 'react-router-dom';
import { useAnimation } from '@/contexts/AnimationContext';
import { Progress } from "@/components/ui/progress";

// Server URL - change this to match your server deployment
const RENDER_SERVER_URL = 'http://localhost:3001';

const RenderView = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { controller } = useAnimation();
  const [isRendering, setIsRendering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [normalizedTime, setNormalizedTime] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [renderProgress, setRenderProgress] = useState(0);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    duration: 10,
    fps: 60,
    quality: 'high',
    filename: 'animation-export'
  });
  
  // Check if render server is online
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch(`${RENDER_SERVER_URL}/status`, { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          setServerStatus('online');
          toast({
            title: 'Render server connected',
            description: 'Ready to export your animations',
            duration: 3000,
          });
        } else {
          setServerStatus('offline');
        }
      } catch (error) {
        console.error('Server connection error:', error);
        setServerStatus('offline');
        toast({
          title: 'Render server offline',
          description: 'Start the server with "cd server && npm start"',
          variant: 'destructive',
          duration: 5000,
        });
      }
    };
    
    checkServerStatus();
  }, [toast]);
  
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
  
  const handleSettingsChange = (newSettings: any) => {
    setSettings(newSettings);
  };
  
  const handleExport = useCallback(async () => {
    if (!controller || !controller.sketchCode) {
      toast({
        title: 'No sketch available',
        description: 'Please create a sketch first',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }
    
    if (serverStatus !== 'online') {
      toast({
        title: 'Render server offline',
        description: 'Make sure the render server is running',
        variant: 'destructive',
        duration: 5000,
      });
      return;
    }
    
    setIsRendering(true);
    setRenderProgress(0);
    setDownloadUrl(null);
    
    toast({
      title: 'Starting export...',
      description: 'Your video is being prepared for export',
      duration: 5000,
    });
    
    try {
      // Simulate progress updates (actual progress would come from the server)
      const progressInterval = setInterval(() => {
        setRenderProgress(prev => {
          const newProgress = prev + Math.random() * 5;
          return newProgress < 95 ? newProgress : prev;
        });
      }, 500);
      
      // Send render request to server
      const response = await fetch(`${RENDER_SERVER_URL}/render`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sketchCode: controller.sketchCode,
          duration: settings.duration,
          fps: settings.fps,
          quality: settings.quality,
          filename: settings.filename
        }),
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error');
      }
      
      const data = await response.json();
      setRenderProgress(100);
      
      if (data.success && data.downloadUrl) {
        setDownloadUrl(`${RENDER_SERVER_URL}${data.downloadUrl}`);
        
        toast({
          title: 'Export complete!',
          description: 'Your video is ready for download',
          duration: 5000,
        });
      } else {
        throw new Error('Invalid server response');
      }
    } catch (error) {
      console.error('Error during export:', error);
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsRendering(false);
    }
  }, [controller, settings, serverStatus, toast]);
  
  // Handle direct download
  const handleDownload = useCallback(() => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  }, [downloadUrl]);
  
  if (!controller) {
    return <div>Loading render view...</div>;
  }
  
  return (
    <div className="flex h-full">
      <div className="w-2/3 content-area flex flex-col items-center justify-center">
        {/* Canvas aspect ratio wrapper without styling */}
        <div className="aspect-[9/16] max-h-[80vh] flex items-center justify-center">
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
        </div>
        
        <div className="mt-4 text-sm">
          <p>Frame: {currentFrame}/{controller.totalFrames-1} | Normalized Time: {normalizedTime.toFixed(4)}</p>
        </div>
      </div>
      
      <div className="w-1/3 content-area">
        <ExportPanel
          duration={settings.duration}
          fps={settings.fps}
          onSettingsChange={handleSettingsChange}
        />
        
        <div className="mt-4">
          {serverStatus === 'checking' && (
            <div className="mb-2 text-sm text-center">
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin h-4 w-4" />
                Checking render server status...
              </span>
            </div>
          )}
          
          {serverStatus === 'offline' && (
            <div className="mb-2 p-2 bg-destructive/10 text-destructive rounded-md text-sm">
              <p className="font-semibold">Render server offline</p>
              <p>Start the server with: <code>cd server && npm start</code></p>
            </div>
          )}
          
          {isRendering && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Rendering progress</span>
                <span>{Math.round(renderProgress)}%</span>
              </div>
              <Progress value={renderProgress} className="h-2" />
            </div>
          )}
          
          {downloadUrl && !isRendering && (
            <Button 
              className="w-full mb-4 flex gap-2" 
              onClick={handleDownload}
              variant="secondary"
            >
              <Download size={16} />
              <span>Download Video</span>
            </Button>
          )}
          
          <Button 
            className="w-full mb-4 flex gap-2" 
            onClick={handleExport}
            disabled={isRendering || serverStatus !== 'online'}
          >
            {isRendering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download size={16} />}
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
        
        <div className="mt-4 p-3 bg-muted rounded-md text-xs">
          <p className="font-semibold">Frame-by-Frame Mode</p>
          <p>Each frame is rendered independently to prevent flickering</p>
          <p>When exporting, every frame will be rendered exactly as shown in preview</p>
        </div>
      </div>
    </div>
  );
};

export default RenderView;
