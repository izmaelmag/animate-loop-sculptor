
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface ExportPanelProps {
  duration: number;
  fps: number;
  onSettingsChange: (settings: {
    duration: number;
    fps: number;
    quality: string;
    filename: string;
  }) => void;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  duration,
  fps,
  onSettingsChange
}) => {
  const [settings, setSettings] = useState({
    duration,
    fps,
    quality: 'high',
    filename: 'animation-export'
  });
  
  const totalFrames = settings.duration * settings.fps;
  
  const handleChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };
  
  return (
    <Card className="p-4 glass-panel animate-slide-in">
      <h3 className="text-lg font-medium mb-4">Export Settings</h3>
      
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="duration">Duration (seconds)</Label>
          <Slider
            id="duration"
            value={[settings.duration]}
            min={1}
            max={60}
            step={1}
            onValueChange={(value) => handleChange('duration', value[0])}
          />
          <div className="text-xs text-muted-foreground text-right">
            {settings.duration}s ({totalFrames} frames)
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="fps">Frame Rate</Label>
          <Select
            value={settings.fps.toString()}
            onValueChange={(value) => handleChange('fps', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select FPS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24">24 fps</SelectItem>
              <SelectItem value="30">30 fps</SelectItem>
              <SelectItem value="60">60 fps</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="quality">Quality</Label>
          <Select
            value={settings.quality}
            onValueChange={(value) => handleChange('quality', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (720p)</SelectItem>
              <SelectItem value="medium">Medium (1080p)</SelectItem>
              <SelectItem value="high">High (1440p)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="filename">File Name</Label>
          <Input
            id="filename"
            value={settings.filename}
            onChange={(e) => handleChange('filename', e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
};

export default ExportPanel;
