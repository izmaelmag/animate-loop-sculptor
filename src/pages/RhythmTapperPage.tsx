import React, { useState, useRef, useEffect, useCallback } from 'react';

const FPS = 60; // Frames per second for calculations

interface TimingResult {
  frame_start: number;
  frame_end: number;
}

// New interface for the desired output structure
interface WordTiming {
    word: string;
    frame_start: number;
    frame_end: number;
}

const RhythmTapperPage: React.FC = () => {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tapFrames, setTapFrames] = useState<number[]>([]);
  const [resultJson, setResultJson] = useState<string>('');
  const [inputText, setInputText] = useState<string>(''); // State for lyrics/text input

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // --- Audio Handling ---
  const handleAudioLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (audioSrc && audioSrc.startsWith('blob:')) {
        URL.revokeObjectURL(audioSrc);
      }
      setAudioSrc(url);
      setTapFrames([]); // Clear previous taps
      setResultJson(''); // Clear previous result
      setInputText(''); // Clear text input as well
      setIsPlaying(false); // Ensure stopped state
      if (audioRef.current) {
          audioRef.current.currentTime = 0;
      }
    }
    // Clear the input value
    if (event.target) event.target.value = ''; 
  };

  const handlePlay = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0; // Always start from beginning
    audioRef.current.play().catch(e => console.error("Audio play error:", e));
    // isPlaying state will be set by the onPlay listener
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    // isPlaying state will be set by the onPause listener
  };

  // Sync isPlaying state with audio element state
  useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const setPlaying = () => setIsPlaying(true);
      const setPaused = () => setIsPlaying(false);

      audio.addEventListener('play', setPlaying);
      audio.addEventListener('playing', setPlaying); // Handle potential async nature
      audio.addEventListener('pause', setPaused);
      audio.addEventListener('ended', setPaused);

      return () => {
          audio.removeEventListener('play', setPlaying);
          audio.removeEventListener('playing', setPlaying);
          audio.removeEventListener('pause', setPaused);
          audio.removeEventListener('ended', setPaused);
      };
  }, [audioSrc]); // Re-attach listeners if src changes

  // --- Tapping Logic ---
  const handleTap = useCallback((event: KeyboardEvent) => {
      if (event.code === 'Space' && isPlaying && audioRef.current) {
          event.preventDefault(); // Prevent page scroll
          const currentFrame = Math.floor(audioRef.current.currentTime * FPS);
          console.log(`Tap registered at frame: ${currentFrame}`);
          // Add tap if it's later than the last one (prevent accidental double taps at same frame)
          setTapFrames(prev => {
              if (prev.length === 0 || currentFrame > prev[prev.length - 1]) {
                 return [...prev, currentFrame]; // No need to sort if always adding later frame
              }
              return prev; 
          });
      }
  }, [isPlaying]); // Dependency: only re-create if isPlaying changes

  useEffect(() => {
    console.log("Attaching keydown listener");
    // Target the specific container div to prevent global capture if needed
    // For now, window is fine for this dedicated page.
    window.addEventListener('keydown', handleTap);
    return () => {
      console.log("Removing keydown listener");
      window.removeEventListener('keydown', handleTap);
    };
  }, [handleTap]); // Re-attach if handleTap changes (due to isPlaying)

  // --- Text Cleaning and Mapping Function ---
  const mapTextToTimings = (text: string, frames: number[]): WordTiming[] => {
      // 1. Clean and split text
      const words = text
          .replace(/[.,!?;:"""']/g, '') // Remove common punctuation
          .split(/\s+/)              // Split by whitespace
          .map(word => word.trim())  // Trim whitespace from each word
          .filter(word => word.length > 0); // Remove empty strings

      // 2. Map words to frame intervals
      const results: WordTiming[] = [];
      const numIntervals = frames.length - 1; // Number of intervals defined by taps
      const count = Math.min(words.length, numIntervals); // Process the minimum of available words or intervals

      console.log(`Mapping ${count} words to ${numIntervals} intervals.`);

      for (let i = 0; i < count; i++) {
          results.push({
              word: words[i],
              frame_start: frames[i],
              frame_end: frames[i + 1]
          });
      }
      
      // Optional: Warn if counts don't match
      if (words.length !== numIntervals) {
           console.warn(`Word count (${words.length}) does not match the number of timing intervals (${numIntervals}). Mapping first ${count} words.`);
      }

      return results;
  };

  // --- Result Generation ---
  const handleGenerateTimings = () => {
      if (tapFrames.length < 2) {
          alert("Need at least two taps to generate timings.");
          setResultJson('[]');
          return;
      }
      if (!inputText.trim()) {
           alert("Please enter the text/lyrics to map.");
           return;
      }
      
      const wordTimings = mapTextToTimings(inputText, tapFrames);
      
      setResultJson(JSON.stringify(wordTimings, null, 2));
  };

  // --- Render ---
  return (
    <div className="p-5 font-sans max-w-3xl mx-auto text-gray-300">
      <h1 className="text-2xl font-bold mb-4">Rhythm Tapper</h1>
      <p className="mb-5">1. Load audio. 2. Paste text. 3. Play & Tap SPACEBAR at the start of each word. 4. Generate JSON.</p>
      
      {/* Audio Loader */}
      <div className="mb-5">
        <input 
          ref={audioInputRef} 
          type="file" 
          accept="audio/*" 
          onChange={handleAudioLoad}
          className="hidden"
        />
        <button 
          onClick={() => audioInputRef.current?.click()} 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer"
        >
          Load Audio File
        </button>
      </div>

      {/* Audio Player & Controls */}
      {audioSrc && (
        <div className="my-5">
          <audio 
            ref={audioRef} 
            src={audioSrc} 
            controls
            className="w-full"
          />
          <div className="mt-3">
            <button 
              onClick={handlePlay} 
              disabled={isPlaying} 
              className="px-4 py-2 mr-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white rounded cursor-pointer disabled:cursor-not-allowed"
            >
              Play from Start
            </button>
            <button 
              onClick={handleStop} 
              disabled={!isPlaying} 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white rounded cursor-pointer disabled:cursor-not-allowed"
            >
              Stop
            </button>
            <span className="ml-5 italic text-gray-400">
                {isPlaying ? 'Playing... Tap SPACEBAR!' : 'Paused/Stopped'}
            </span>
          </div>
        </div>
      )}

      {/* Text Input Area */}
      {audioSrc && ( // Only show text area if audio is loaded
          <div className="my-5">
              <label htmlFor="lyricsInput" className="block text-lg mb-2">Enter Text/Lyrics:</label>
              <textarea
                  id="lyricsInput"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your lyrics or text here..."
                  rows={8}
                  className="w-full font-mono text-sm bg-gray-800 border border-gray-700 rounded p-2 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
          </div>
      )}

      {/* Taps Display (for feedback) */}
       <div className="my-5">
           <h4 className="text-lg mb-2">Registered Taps (Frames):</h4>
           <div className="bg-gray-800 text-gray-200 border border-gray-700 rounded p-3 min-h-[60px] max-h-[150px] overflow-y-auto text-sm break-all">
               {tapFrames.length > 0 ? tapFrames.join(', ') : 'No taps yet.'}
           </div>
       </div>

      {/* Generate Button & Results */}
      <div className="mt-5">
        <button 
          onClick={handleGenerateTimings} 
          // Disable if no text OR not enough taps
          disabled={tapFrames.length < 2 || !inputText.trim()} 
          className="px-4 py-2 mr-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white rounded cursor-pointer disabled:cursor-not-allowed"
        >
          Generate Word Timings JSON
        </button>
        {resultJson && (
          <textarea 
            readOnly 
            value={resultJson} 
            className="w-full min-h-[200px] mt-3 font-mono text-xs whitespace-pre overflow-x-scroll bg-gray-900 border border-gray-700 rounded p-2 text-gray-200"
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          />
        )}
      </div>
    </div>
  );
};

export default RhythmTapperPage; 