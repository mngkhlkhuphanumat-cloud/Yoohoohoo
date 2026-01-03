
import React, { useState, useRef, useEffect } from 'react';
import { Message, GameState } from '../types';

interface GameAIPanelProps {
  messages: Message[];
  gameState: GameState;
  onSendMessage: (text: string) => void;
  onToggleLearning: () => void;
  onClose: () => void;
}

export const GameAIPanel: React.FC<GameAIPanelProps> = ({
  messages,
  gameState,
  onSendMessage,
  onToggleLearning,
  onClose
}) => {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-[90] bg-neutral-950/95 backdrop-blur-2xl flex flex-col md:flex-row p-4 md:p-8 gap-6 animate-in fade-in zoom-in duration-300 overflow-y-auto md:overflow-hidden">
      
      {/* AI "PLAY" ENGINE & STATUS (Left/Top side) */}
      <div className="flex-1 flex flex-col gap-6 min-h-[400px]">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.642.316a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.823.362 2.25 2.25 0 00-1.35 1.761 2.25 2.25 0 002.321 2.45h13.04a2.25 2.25 0 002.321-2.45 2.25 2.25 0 00-1.35-1.761z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Cognitive Link</h2>
                    <p className="text-xs text-neutral-400 font-mono">Neural Status: {gameState.isLearning ? 'SYNCHRONIZED' : 'STANDBY'}</p>
                </div>
            </div>
            <button 
                onClick={onToggleLearning}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2
                    ${gameState.isLearning 
                        ? 'bg-red-500/20 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white' 
                        : 'bg-green-500/20 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white'}`}
            >
                <div className={`w-2 h-2 rounded-full ${gameState.isLearning ? 'bg-red-500' : 'bg-green-500'}`} />
                {gameState.isLearning ? 'SUSPEND AGENT' : 'ENGAGE AGENT'}
            </button>
        </div>

        {/* Vision Feed Preview */}
        <div className="relative aspect-video bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden group shadow-2xl">
          {gameState.capturedFrame ? (
            <img src={gameState.capturedFrame} className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-500" alt="Capture" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 p-8 text-center">
               <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
               </svg>
               <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">Awaiting Display Feed</p>
               <p className="text-[9px] text-neutral-600 mt-2 max-w-[200px]">Note: Mobile browsers may restrict capturing other applications.</p>
            </div>
          )}
          <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Suggested Command</span>
                <div className="flex-1 h-px bg-white/10" />
            </div>
            <p className="text-lg font-bold text-white tracking-tight leading-tight">
               {gameState.suggestedAction || "Analyzing environment..."}
            </p>
          </div>
        </div>

        {/* Intelligence Board */}
        <div className="flex-1 bg-neutral-900/50 rounded-2xl border border-neutral-800 p-6 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Real-time Insights</h3>
                <div className="bg-cyan-500/10 text-cyan-400 text-[9px] px-2 py-0.5 rounded border border-cyan-500/20 font-bold">APK MODE ENABLED</div>
            </div>
            <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-sm text-neutral-300 font-medium leading-relaxed">
                        {gameState.lastAnalysis}
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                        <span className="block text-[10px] text-cyan-400 uppercase font-black mb-1">Win Rate</span>
                        <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500" style={{ width: '74%' }}></div>
                        </div>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                        <span className="block text-[10px] text-purple-400 uppercase font-black mb-1">Neural Sync</span>
                        <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: '89%' }}></div>
                        </div>
                    </div>
                </div>
                
                {/* Installation Hint for Mobile */}
                <div className="p-3 bg-neutral-800/50 rounded-xl border border-white/5">
                    <p className="text-[9px] text-neutral-500 uppercase font-bold mb-1">PWA Installation</p>
                    <p className="text-[10px] text-neutral-400">To use as a full app: Tap <span className="text-white">Share</span> then <span className="text-white">"Add to Home Screen"</span></p>
                </div>
            </div>
        </div>
      </div>

      {/* CHAT INTERFACE (Right side) */}
      <div className="w-full md:w-[400px] h-[500px] md:h-auto flex flex-col bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
            <span className="text-xs font-black uppercase tracking-widest text-neutral-400">Tactical Comms</span>
            <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-cyan-500/50 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-neutral-700" />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-xs font-bold uppercase tracking-widest">Awaiting Uplink</p>
            </div>
          )}
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-cyan-600 text-white rounded-br-none shadow-lg shadow-cyan-500/20' 
                  : 'bg-neutral-800 text-neutral-200 rounded-bl-none border border-neutral-700'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-neutral-950 border-t border-neutral-800">
          <div className="relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Query GameGhost..."
              className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm rounded-xl py-3 px-4 pr-12 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-neutral-600"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 p-1.5 text-cyan-500 hover:text-cyan-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      <button 
        onClick={onClose}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 md:static text-xs font-bold text-neutral-500 uppercase tracking-widest hover:text-white transition-colors p-4 md:p-2 bg-black/40 md:bg-transparent rounded-full backdrop-blur-md md:backdrop-blur-none"
      >
        Minimize Overlay
      </button>
    </div>
  );
};
