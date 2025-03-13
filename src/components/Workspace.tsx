
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './Header';
import SketchView from './SketchView';
import RenderView from './RenderView';

const Workspace = () => {
  const location = useLocation();
  const [view, setView] = useState<'sketch' | 'render'>('sketch');
  
  // Update view based on URL path
  useEffect(() => {
    if (location.pathname === '/render') {
      setView('render');
    } else {
      setView('sketch');
    }
  }, [location.pathname]);
  
  return (
    <div className="workspace">
      <Header />
      <main className="flex-1 overflow-hidden">
        {view === 'sketch' ? <SketchView /> : <RenderView />}
      </main>
    </div>
  );
};

export default Workspace;
