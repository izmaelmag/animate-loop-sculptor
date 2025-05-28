// Workspace hosts the SketchView and displays the Sculptor header.

import { LoaderPinwheel } from "lucide-react";
import SketchView from "./SketchView";
import { useIsMobile } from "@/hooks/use-mobile";

const Workspace = () => {
  const isMobile = useIsMobile();

  return (
    <div className="workspace">
      <main className="flex-1 overflow-hidden">
        <div className="text-md md:text-xl font-bold absolute top-0 left-0 p-2 md:p-4 flex items-center gap-1 md:gap-2">
          <LoaderPinwheel size={isMobile ? 20 : 24} className="text-white" />
          <span className="text-white">Sculptor</span>
        </div>

        <SketchView />
      </main>
    </div>
  );
};

export default Workspace;
