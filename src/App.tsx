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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AnimationProvider>
          <Toaster />
          <Sonner />
          <nav 
             className="fixed bottom-4 right-4 z-50 bg-gray-800/90 backdrop-blur-sm rounded-md p-2 shadow-lg flex gap-3"
          >
            <Link to="/" className="text-blue-400 hover:text-blue-300 text-sm">Home</Link>
            <Link to="/editor" className="text-blue-400 hover:text-blue-300 text-sm">Editor</Link>
            <Link to="/tapper" className="text-blue-400 hover:text-blue-300 text-sm">Tapper</Link>
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
