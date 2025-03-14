import { Amphora, LoaderPinwheel } from "lucide-react";
import SketchView from "./SketchView";

const Workspace = () => {
  return (
    <div className="workspace">
      <main className="flex-1 overflow-hidden">
        <div className="text-xl font-bold absolute top-0 left-0 p-4 flex items-center gap-2">
          <LoaderPinwheel size={24} className="text-white" />
          <span className="text-white">Sculptor</span>
        </div>
        <SketchView />
      </main>
    </div>
  );
};

export default Workspace;
