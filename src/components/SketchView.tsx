
import { useState, useEffect, useRef } from 'react';
import p5 from 'p5';
import { Card } from "@/components/ui/card";
import Timeline from './Timeline';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { defaultSketch, gsapSequenceSketch } from '@/utils/templates';

const DURATION = 10; // 10 seconds duration
const FPS = 60;

const SketchView = () => {
  const sketchRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const [normalizedTime, setNormalizedTime] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [sketchCode, setSketchCode] = useState(defaultSketch);
  
  // Initialize and clean up p5 instance
  useEffect(() => {
    if (!sketchRef.current) return;
    
    // Clean up previous instance if it exists
    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
    }
    
    try {
      // Create a sketch function with the normalized time available
      const sketch = (p: p5) => {
        // Inject the normalized time value into the sketch
        const sketchWithTime = new Function('p', 'normalizedTime', sketchCode);
        
        p.setup = () => {
          // Create canvas with 9:16 aspect ratio for Instagram Reels
          const width = 360; // Scaled down for performance
          const height = 640;
          p.createCanvas(width, height);
          p.frameRate(FPS);
        };
        
        p.draw = () => {
          // Run the user's sketch code with the current normalized time
          sketchWithTime(p, normalizedTime);
        };
      };
      
      // Create a new p5 instance with the sketch
      p5InstanceRef.current = new p5(sketch, sketchRef.current);
    } catch (error) {
      console.error('Error creating p5 sketch:', error);
    }
    
    // Clean up on unmount
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
      }
    };
  }, [sketchCode]);
  
  const handleTimeUpdate = (_time: number, normalized: number) => {
    setNormalizedTime(normalized);
  };
  
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    setSketchCode(template === 'default' ? defaultSketch : gsapSequenceSketch);
  };
  
  return (
    <div className="flex h-full">
      <div className="w-2/3 content-area flex flex-col items-center justify-center">
        <div className="aspect-reels max-h-[80vh]" ref={sketchRef} />
      </div>
      
      <div className="w-1/3 content-area">
        <Card className="p-4 mb-4">
          <h3 className="text-lg font-medium mb-2">Animation Settings</h3>
          <Tabs value={selectedTemplate} onValueChange={handleTemplateChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="default">Basic Template</TabsTrigger>
              <TabsTrigger value="gsap">GSAP Sequence</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="h-[400px] overflow-auto bg-muted p-4 rounded-md mb-4 font-mono text-xs">
            <pre>{sketchCode}</pre>
          </div>
          
          <div className="flex justify-end">
            <Button className="mt-2">Edit Sketch</Button>
          </div>
        </Card>
        
        <Timeline 
          duration={DURATION} 
          fps={FPS} 
          onTimeUpdate={handleTimeUpdate} 
        />
      </div>
    </div>
  );
};

export default SketchView;
