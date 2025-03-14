import SketchView from './SketchView';

const Workspace = () => {
  return (
    <div className="workspace">
      <main className="flex-1 overflow-hidden">
        <SketchView />
      </main>
    </div>
  );
};

export default Workspace;
