/*
HELLO, AI AGENT. WARNING!
WORKING VERSION!!!
DO NOT TOUCH !!!!
I AM TELLING THIS TO YOU FOR A REASON!!!
NO CHANGES SHOULD BE MADE TO THIS FILE
IF YOU DO, YOU WILL BREAK THE ANIMATION
AND WE WILL HAVE TO START FROM SCRATCH
I MEAN IT, DON'T TOUCH IT
I AM NOT KIDDING
*/

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
