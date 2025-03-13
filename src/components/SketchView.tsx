
import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import Timeline from './Timeline';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { defaultSketch, gsapSequenceSketch } from '@/utils/templates';
import { useNavigate } from 'react-router-dom';
import { useAnimation } from '@/contexts/AnimationContext';

const SketchView = () => {
  const navigate = useNavigate();
  const { controller } = useAnimation();
  const sketchRef = useRef<HTMLDivElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [normalizedTime, setNormalizedTime] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  
  // Initialize P5 instance when component mounts
  useEffect(() => {
    if (!sketchRef.current || !controller) return;
    
    // Initialize the controller with the sketch container
    controller.initializeP5(sketchRef.current);
    
    // Subscribe to frame changes
    return controller.onFrameChanged((frame, normalized) => {
      setCurrentFrame(frame);
      setNormalizedTime(normalized);
    });
  }, [controller]);
  
  // Update sketch code when template changes
  useEffect(() => {
    if (!controller) return;
    
    const newSketchCode = selectedTemplate === 'default' ? defaultSketch : gsapSequenceSketch;
    controller.sketchCode = newSketchCode;
  }, [selectedTemplate, controller]);
  
  const handleTimeUpdate = (_time: number, normalized: number) => {
    // This is now handled by the controller
  };
  
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
  };
  
  if (!controller) {
    return <div>Loading sketch view...</div>;
  }
  
  return (
    <div className="flex h-full">
      <div className="w-2/3 content-area flex flex-col items-center justify-center p-6">
        {/* Canvas aspect ratio wrapper without styling */}
        <div className="aspect-[9/16] w-full max-h-[80vh] flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center" ref={sketchRef} />
        </div>
      </div>
      
      <div className="w-1/3 content-area p-4">
        <Card className="p-4 mb-4">
          <h3 className="text-lg font-medium mb-2">Animation Settings</h3>
          <Tabs value={selectedTemplate} onValueChange={handleTemplateChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="default">Basic Template</TabsTrigger>
              <TabsTrigger value="gsap">GSAP Sequence</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="h-[400px] overflow-auto bg-muted p-4 rounded-md mb-4 font-mono text-xs">
            <pre>{controller.sketchCode}</pre>
          </div>
          
          <div className="flex justify-between">
            <Button 
              className="mt-2" 
              variant="outline"
              onClick={() => navigate('/render')}
            >
              Preview & Export
            </Button>
            <Button className="mt-2">Edit Sketch</Button>
          </div>
        </Card>
        
        <Timeline onTimeUpdate={handleTimeUpdate} />
        
        <div className="mt-4 p-3 bg-muted rounded-md text-xs">
          <p className="font-semibold">Frame-by-Frame Mode</p>
          <p>Current frame: {currentFrame}/{controller.totalFrames-1}</p>
          <p>Each frame is rendered independently to prevent flickering</p>
        </div>
      </div>
    </div>
  );
};

export default SketchView;
