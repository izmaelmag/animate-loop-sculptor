
import { useState, useEffect, useRef } from 'react';
import p5 from 'p5';
import { Card } from "@/components/ui/card";
import Timeline from './Timeline';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { defaultSketch, gsapSequenceSketch } from '@/utils/templates';
import { useNavigate } from 'react-router-dom';

const DURATION = 10; // 10 seconds duration
const FPS = 60;

const SketchView = () => {
  const navigate = useNavigate();
  const sketchRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const [normalizedTime, setNormalizedTime] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [sketchCode, setSketchCode] = useState(defaultSketch);
  const sketchFunctionRef = useRef<Function | null>(null);
  
  const totalFrames = DURATION * FPS;
  
  // Create a persistent P5 instance once
  useEffect(() => {
    if (!sketchRef.current || p5InstanceRef.current) return;
    
    try {
      // Create a sketch function that will be updated but not recreated
      const sketch = (p: p5) => {
        let canvasWidth = 0;
        let canvasHeight = 0;
        
        p.setup = () => {
          // Create canvas with 9:16 aspect ratio for Instagram Reels
          const container = sketchRef.current;
          canvasWidth = container ? container.clientWidth : 360;
          canvasHeight = (canvasWidth * 16) / 9; // Maintain 9:16 aspect ratio
          p.createCanvas(canvasWidth, canvasHeight);
          p.frameRate(FPS);
          p.background(0); // Initialize with black background
        };
        
        p.draw = () => {
          // Only redraw the canvas if we have a sketch function to run
          if (sketchFunctionRef.current) {
            try {
              // Clear canvas on each frame to prevent artifacts
              p.clear();
              p.background(0);
              
              // Calculate exact frame number
              const exactFrame = Math.floor(normalizedTime * (totalFrames - 1));
              
              // Execute the current sketch function
              sketchFunctionRef.current(p, normalizedTime, exactFrame, totalFrames);
            } catch (error) {
              console.error('Error executing sketch:', error);
              p.background(255, 0, 0);
              p.fill(255);
              p.textSize(24);
              p.textAlign(p.CENTER, p.CENTER);
              p.text(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, p.width/2, p.height/2);
            }
          } else {
            // Fallback when no sketch function is available
            p.background(0);
            p.fill(255);
            p.textSize(24);
            p.textAlign(p.CENTER, p.CENTER);
            p.text('Loading sketch...', p.width/2, p.height/2);
          }
        };
        
        // Handle window resize to maintain aspect ratio
        p.windowResized = () => {
          if (sketchRef.current) {
            const newWidth = sketchRef.current.clientWidth;
            const newHeight = (newWidth * 16) / 9;
            p.resizeCanvas(newWidth, newHeight);
          }
        };
      };
      
      // Create a single persistent p5 instance
      p5InstanceRef.current = new p5(sketch, sketchRef.current);
    } catch (error) {
      console.error('Error creating p5 sketch:', error);
    }
    
    // Clean up on unmount
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, []);
  
  // Update the sketch function reference when sketchCode changes, without recreating the P5 instance
  useEffect(() => {
    try {
      // Create a function from the sketch code with parameters
      sketchFunctionRef.current = new Function(
        'p', 
        'normalizedTime', 
        'frameNumber', 
        'totalFrames',
        sketchCode
      );
    } catch (error) {
      console.error('Error compiling sketch code:', error);
      sketchFunctionRef.current = null;
    }
  }, [sketchCode]);
  
  const handleTimeUpdate = (_time: number, normalized: number) => {
    setNormalizedTime(normalized);
    setCurrentFrame(Math.floor(normalized * (totalFrames - 1)));
  };
  
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    setSketchCode(template === 'default' ? defaultSketch : gsapSequenceSketch);
  };
  
  return (
    <div className="flex h-full">
      <div className="w-2/3 content-area flex flex-col items-center justify-center p-6">
        <Card className="p-0 overflow-hidden aspect-[9/16] w-full max-h-[80vh] bg-black animate-fade-in">
          <div className="w-full h-full" ref={sketchRef} />
        </Card>
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
            <pre>{sketchCode}</pre>
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
        
        <Timeline 
          duration={DURATION} 
          fps={FPS} 
          onTimeUpdate={handleTimeUpdate} 
        />
        
        <div className="mt-4 p-3 bg-muted rounded-md text-xs">
          <p className="font-semibold">Frame-by-Frame Mode</p>
          <p>Current frame: {currentFrame}/{totalFrames-1}</p>
          <p>Each frame is rendered independently to prevent flickering</p>
        </div>
      </div>
    </div>
  );
};

export default SketchView;
