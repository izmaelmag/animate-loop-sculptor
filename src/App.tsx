import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Link } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AnimationProvider } from "./contexts";
import TimelineEditor from './components/TimelineEditor';
import RhythmTapperPage from './pages/RhythmTapperPage';

const queryClient = new QueryClient();

const App = () => {
  const navStyle: React.CSSProperties = { padding: '10px 20px', backgroundColor: '#eee', marginBottom: '20px' };
  const linkStyle: React.CSSProperties = { marginRight: '15px', textDecoration: 'none', color: 'blue' };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AnimationProvider>
          <Toaster />
          <Sonner />
          <nav style={navStyle}>
            <Link to="/" style={linkStyle}>Home (Index Page)</Link>
            <Link to="/editor" style={linkStyle}>Timeline Editor</Link>
            <Link to="/tapper" style={linkStyle}>Rhythm Tapper</Link>
          </nav>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/editor" element={<TimelineEditor />} />
            <Route path="/tapper" element={<RhythmTapperPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
