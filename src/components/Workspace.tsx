// Workspace hosts the Sidebar and SketchView in a sidebar layout.

import Sidebar from "./Sidebar";
import SketchView from "./SketchView";
import SettingsPanel from "./SettingsPanel";
import AnimationParamsPane from "./AnimationParamsPane";
import { useIsMobile } from "../hooks/use-mobile";
import { LoaderPinwheel } from "lucide-react";

const Workspace = () => {
  const isMobile = useIsMobile();

  // Mobile layout: header + settings + canvas
  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-black">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <LoaderPinwheel size={20} className="text-white" />
            <span className="text-white text-lg font-bold">Sculptor</span>
          </div>
          <SettingsPanel />
        </div>
        <div className="flex-1 overflow-hidden main-section">
          <SketchView />
        </div>
      </div>
    );
  }

  // Desktop layout: sidebar + main section
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-hidden main-section">
        <SketchView />
      </main>
      <AnimationParamsPane />
    </div>
  );
};

export default Workspace;
