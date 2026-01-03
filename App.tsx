
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FloatingTrigger } from './components/FloatingTrigger';
import { GameAIPanel } from './components/GameAIPanel';
import { Message, GameState } from './types';
import { gemini } from './services/geminiService';

const App: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    isLearning: false,
    lastAnalysis: "Ready to start learning...",
    suggestedAction: "Wait for capture",
    capturedFrame: null,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analysisInterval = useRef<number | null>(null);

  const startScreenCapture = async () => {
    try {
      setError(null);
      
      // Feature detection with fallback
      const mediaDevices = navigator.mediaDevices as any;
      const getDisplayMedia = (mediaDevices?.getDisplayMedia || (navigator as any).getDisplayMedia)?.bind(mediaDevices || navigator);

      if (!getDisplayMedia) {
        throw new Error("Screen capture (getDisplayMedia) is not supported in this browser environment. Note: Mobile browsers usually don't support capturing other apps. Please use a desktop browser like Chrome.");
      }

      const stream = await getDisplayMedia({
        video: { cursor: "always" },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCapturing(true);
          setIsOpen(true);
        };
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: "I'm connected! I can see your screen now. Let's conquer this game together.",
          timestamp: Date.now()
        }]);
      }
    } catch (err: any) {
      console.error("Error starting screen capture:", err);
      setError(err.message || "Failed to start screen capture.");
    }
  };

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState < 2) return null;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Scale down for API efficiency
    const scale = 0.5;
    canvas.width = (video.videoWidth || 1280) * scale;
    canvas.height = (video.videoHeight || 720) * scale;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.6);
    }
    return null;
  }, []);

  const runAnalysisCycle = useCallback(async () => {
    if (!isCapturing || !gameState.isLearning) return;

    const frame = captureFrame();
    if (!frame) return;

    setGameState(prev => ({ ...prev, capturedFrame: frame }));
    
    const analysis = await gemini.analyzeFrame(frame, "Playing a game like Undertale. Focus on progression, boss patterns, and NPC interactions.");
    if (analysis) {
      setGameState(prev => ({
        ...prev,
        lastAnalysis: analysis.learning,
        suggestedAction: analysis.action
      }));
    }
  }, [isCapturing, gameState.isLearning, captureFrame]);

  useEffect(() => {
    if (gameState.isLearning && isCapturing) {
      analysisInterval.current = window.setInterval(runAnalysisCycle, 4000);
    } else {
      if (analysisInterval.current) clearInterval(analysisInterval.current);
    }
    return () => {
      if (analysisInterval.current) clearInterval(analysisInterval.current);
    };
  }, [gameState.isLearning, isCapturing, runAnalysisCycle]);

  const toggleLearning = () => {
    setGameState(prev => ({ ...prev, isLearning: !prev.isLearning }));
    const status = !gameState.isLearning ? "Neural Agent Engaged. Automated learning active." : "Neural Agent Suspended.";
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: status,
      timestamp: Date.now()
    }]);
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);

    const currentFrame = captureFrame();
    const aiResponseText = await gemini.chatWithAI([...messages, userMsg], currentFrame || undefined);
    
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponseText || "I'm processing the visual stream...",
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, aiMsg]);
  };

  return (
    <div className="relative w-screen h-screen bg-neutral-950 overflow-hidden font-sans select-none">
      {/* Hidden Video Feed for Capture */}
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {/* Background/Standby UI */}
      {!isCapturing && (
        <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-4 animate-in fade-in duration-700">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.3)] animate-pulse">
              <svg className="w-16 h-16 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 bg-cyan-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg shadow-cyan-500/50">Core v3</div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tight text-white italic">GAMEGHOST<span className="text-cyan-500">.</span>AI</h1>
            <p className="text-neutral-500 max-w-sm mx-auto text-sm leading-relaxed">
              Autonomous neural gaming companion. <br/> 
              <span className="text-neutral-400">Analysis. Strategy. Execution.</span>
            </p>
          </div>

          {error && (
            <div className="max-w-md p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium animate-in slide-in-from-top-2">
              <span className="font-bold uppercase mb-1 block">Connection Error</span>
              {error}
            </div>
          )}

          <button 
            onClick={startScreenCapture}
            className="group relative px-10 py-5 bg-white text-black font-black rounded-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden shadow-2xl shadow-white/10"
          >
            <span className="relative z-10 uppercase tracking-widest">Connect Neural Link</span>
            <div className="absolute inset-0 bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </button>
        </div>
      )}

      {/* The Floating Button (Top Left) */}
      <FloatingTrigger 
        isActive={isOpen} 
        onClick={() => setIsOpen(!isOpen)} 
        isCapturing={isCapturing}
      />

      {/* The Main Overlay Panel */}
      {isOpen && (
        <GameAIPanel 
          messages={messages}
          gameState={gameState}
          onSendMessage={handleSendMessage}
          onToggleLearning={toggleLearning}
          onClose={() => setIsOpen(false)}
        />
      )}

      {/* Persistent "Ghost" Overlay State */}
      {isCapturing && (
        <div className="pointer-events-none fixed inset-0 border-[3px] border-cyan-500/10 animate-pulse z-[80]" />
      )}

      {/* Compact Status Indicator when Panel is Closed */}
      {isCapturing && !isOpen && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-2xl px-5 py-2.5 rounded-2xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Ghost Link Active</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <span className="text-[10px] text-cyan-400 font-mono font-bold">
            {gameState.isLearning ? "AUTO-LEARN: ON" : "MONITORING"}
          </span>
        </div>
      )}
    </div>
  );
};

export default App;
