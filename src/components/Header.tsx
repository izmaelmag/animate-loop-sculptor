
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Download, Pencil, Video } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    toast({
      title: "Starting export...",
      description: "Your video is being prepared for export.",
    });
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Export complete!",
        description: "Your video has been successfully exported.",
      });
    }, 3000);
  };

  const handleTabChange = (value: string) => {
    navigate(`/${value === "sketch" ? "" : value}`);
  };

  const currentTab = location.pathname === "/" ? "sketch" : "render";

  return (
    <header className="border-b bg-card animate-fade-in">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">P5 Loop Studio</h1>
          <Separator orientation="vertical" className="h-6" />
          <Tabs value={currentTab} onValueChange={handleTabChange} className="w-fit">
            <TabsList>
              <TabsTrigger value="sketch" className="flex gap-2">
                <Pencil size={16} />
                <span>Sketch</span>
              </TabsTrigger>
              <TabsTrigger value="render" className="flex gap-2">
                <Video size={16} />
                <span>Render</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExport}
            disabled={isExporting || currentTab !== "render"}
            className="flex gap-2"
          >
            <Download size={16} />
            <span>{isExporting ? "Exporting..." : "Export Video"}</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
