import { useState, useCallback, useEffect } from "react";
import { Player, PlayerRef } from "@remotion/player";
import { Card } from "@/components/ui/card";
import ExportPanel from "./ExportPanel";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { P5Animation } from "@/remotion/P5Animation";
import { useNavigate } from "react-router-dom";
import { useAnimation } from "@/contexts/AnimationContext";
import { Progress } from "@/components/ui/progress";
import { useRef } from "react";
import Timeline from "./Timeline";
import axios from "axios";

type Settings = {
  duration: number;
  fps: number;
  quality: string;
  filename: string;
};

const RenderView = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { controller } = useAnimation();
  const playerRef = useRef<PlayerRef>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>({
    duration: 10,
    fps: 60,
    quality: "high",
    filename: "animation-export",
  });

  // For tracking the render job ID
  const [renderId, setRenderId] = useState<string | null>(null);

  // Update settings based on controller - converted to useEffect
  useEffect(() => {
    if (!controller) return;

    setSettings((prev) => ({
      ...prev,
      duration: controller.duration,
      fps: controller.fps,
    }));
  }, [controller]);

  // Poll for render progress
  useEffect(() => {
    let intervalId: number | null = null;

    if (isRendering && renderId) {
      console.log(`Starting polling for render job: ${renderId}`);
      
      intervalId = window.setInterval(async () => {
        try {
          console.log(`Polling for status of render job: ${renderId}`);
          const response = await axios.get(`/api/render/status/${renderId}`);

          console.log('Status response:', response.data);
          
          if (response.data && typeof response.data.progress === "number") {
            setRenderProgress(response.data.progress);

            // If rendering is complete
            if (response.data.progress >= 100 && response.data.downloadUrl) {
              setIsRendering(false);
              setDownloadUrl(response.data.downloadUrl);
              clearInterval(intervalId!);

              toast({
                title: "Export complete!",
                description: "Your video is ready for download",
                duration: 5000,
              });
            }
          }
        } catch (error) {
          console.error("Error checking render status:", error);
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            // Render job not found, stop polling
            console.log("Render job not found, stopping polling");
            clearInterval(intervalId!);
            setIsRendering(false);
            
            toast({
              title: "Rendering failed",
              description: "The render job was not found. It may have been cancelled or failed to start.",
              variant: "destructive",
              duration: 5000,
            });
          }
          // For other errors, continue polling
        }
      }, 2000); // Check every 2 seconds
    }

    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [isRendering, renderId, toast]);

  const handleSettingsChange = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  const handleExport = useCallback(async () => {
    if (!controller || !controller.sketchCode) {
      toast({
        title: "No sketch available",
        description: "Please create a sketch first",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Reset state for new render
    setIsRendering(true);
    setRenderProgress(0);
    setDownloadUrl(null);
    setRenderId(null);

    toast({
      title: "Starting export...",
      description: "Your video is being prepared for export",
      duration: 5000,
    });

    console.log("Starting video export...");
    
    try {
      // Make sure the API server is available first
      try {
        await axios.get("/test");
      } catch (error) {
        console.error("Render server not available:", error);
        throw new Error("Render server is not available. Please start the render server.");
      }
      
      console.log("Sending render request with sketch code length:", controller.sketchCode.length);
      
      const response = await axios.post("/api/render", {
        sketchCode: controller.sketchCode,
        duration: settings.duration,
        fps: settings.fps,
        quality: settings.quality,
        filename: settings.filename,
      });

      console.log("Render response:", response.data);
      
      if (response.data && response.data.success) {
        // Store the render ID for polling
        if (response.data.renderId) {
          console.log("Got render ID:", response.data.renderId);
          setRenderId(response.data.renderId);
          
          toast({
            title: "Rendering started",
            description: "Your video is being rendered. This may take a few minutes.",
            duration: 5000,
          });
        } else if (response.data.downloadUrl) {
          // Immediate completion (unlikely but possible)
          console.log("Got immediate download URL:", response.data.downloadUrl);
          setDownloadUrl(response.data.downloadUrl);
          setIsRendering(false);

          toast({
            title: "Export complete!",
            description: "Your video is ready for download",
            duration: 5000,
          });
        } else {
          throw new Error(
            "Invalid server response: missing renderId and downloadUrl"
          );
        }
      } else {
        throw new Error(response.data?.error || "Invalid server response");
      }
    } catch (error) {
      console.error("Error rendering video:", error);
      setIsRendering(false);

      toast({
        title: "Export failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [controller, settings, toast]);

  const handleDownload = useCallback(() => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    }
  }, [downloadUrl]);

  // Cancel rendering if in progress
  const handleCancelRender = useCallback(async () => {
    if (isRendering && renderId) {
      try {
        await axios.post(`/api/render/cancel/${renderId}`);
        setIsRendering(false);
        toast({
          title: "Rendering cancelled",
          description: "The video export process has been cancelled",
          duration: 3000,
        });
      } catch (error) {
        console.error("Error cancelling render:", error);
      }
    }
  }, [isRendering, renderId, toast]);

  if (!controller) {
    return <div>Loading render view...</div>;
  }

  return (
    <div className="flex h-full">
      <div className="w-2/3 content-area flex flex-col items-center justify-center">
        <Card className="aspect-[9/16] max-h-[80vh] flex items-center justify-center overflow-hidden">
          <Player
            ref={playerRef}
            component={P5Animation}
            durationInFrames={settings.duration * settings.fps}
            fps={settings.fps}
            compositionWidth={1080}
            compositionHeight={1920}
            style={{ width: "100%", height: "100%" }}
            controls
            loop
            showVolumeControls={false}
            allowFullscreen
            inputProps={{
              sketch: controller.sketchCode,
            }}
            autoPlay
            acknowledgeRemotionLicense={true}
          />
        </Card>

        <div className="mt-4 text-sm p-2 bg-muted rounded-md">
          <p>Use the player controls above to preview your animation</p>
        </div>
      </div>

      <div className="w-1/3 content-area">
        <ExportPanel
          duration={settings.duration}
          fps={settings.fps}
          onSettingsChange={handleSettingsChange}
        />

        <div className="mt-4">
          {isRendering && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Rendering progress</span>
                <span>{Math.round(renderProgress)}%</span>
              </div>
              <Progress value={renderProgress} className="h-2" />
              <Button
                variant="destructive"
                size="sm"
                className="w-full mt-2"
                onClick={handleCancelRender}
              >
                Cancel Render
              </Button>
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
            disabled={isRendering}
          >
            {isRendering ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download size={16} />
            )}
            <span>{isRendering ? "Rendering..." : "Export Video"}</span>
          </Button>

          <Button
            variant="outline"
            className="w-full mb-4"
            onClick={() => navigate("/")}
            disabled={isRendering}
          >
            Back to Sketch Editor
          </Button>
        </div>

        <Timeline isPlayable={!isRendering} />

        <div className="mt-4 p-3 bg-muted rounded-md text-xs">
          <p className="font-semibold">Remotion Rendering</p>
          <p>
            Using Remotion to export frame-accurate videos of your P5.js
            animations
          </p>
          <p>
            Each frame is rendered independently to ensure consistent quality
          </p>
        </div>
      </div>
    </div>
  );
};

export default RenderView;
