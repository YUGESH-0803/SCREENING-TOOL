
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats } from '../types';

interface ReactionGameProps {
  onComplete: (stats: GameStats) => void;
}

export const ReactionGame: React.FC<ReactionGameProps> = ({ onComplete }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [targetVisible, setTargetVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);

  const TOTAL_TARGETS = 10;

  const spawnTarget = useCallback(() => {
    if (containerRef.current) {
      setTargetVisible(false);
      // Brief delay between targets for visual separation
      setTimeout(() => {
        const { width, height } = containerRef.current!.getBoundingClientRect();
        const padding = 60;
        const x = Math.random() * (width - padding * 2) + padding;
        const y = Math.random() * (height - padding * 2) + padding;
        setTargetPos({ x, y });
        setTargetVisible(true);
        startTimeRef.current = performance.now();
      }, 100);
    }
  }, []);

  const startGame = () => {
    setGameState('playing');
    setHits(0);
    setMisses(0);
    setReactionTimes([]);
    spawnTarget();
  };

  const handleTargetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!targetVisible) return;

    const endTime = performance.now();
    const rt = endTime - startTimeRef.current;
    
    setReactionTimes(prev => [...prev, rt]);
    setHits(prev => {
      const newHits = prev + 1;
      if (newHits >= TOTAL_TARGETS) {
        setGameState('finished');
      } else {
        spawnTarget();
      }
      return newHits;
    });
  };

  const handleContainerClick = () => {
    if (gameState === 'playing') {
      setMisses(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (gameState === 'finished') {
      const avgRT = reactionTimes.reduce((a, b) => a + b, 0) / TOTAL_TARGETS;
      const accuracy = (hits / (hits + misses)) * 100;
      const variance = reactionTimes.map(rt => Math.pow(rt - avgRT, 2)).reduce((a, b) => a + b, 0) / TOTAL_TARGETS;
      const stability = Math.max(0, 100 - (Math.sqrt(variance) / 10));

      onComplete({
        averageReactionTime: avgRT,
        accuracy: accuracy,
        stability: stability
      });
    }
  }, [gameState, hits, misses, reactionTimes, onComplete]);

  return (
    <div className="flex flex-col items-center animate-in fade-in duration-700">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-black text-slate-800 mb-2">Motor Reaction Speed</h2>
        <p className="text-slate-500 text-sm font-medium">Tap each target as soon as it appears.</p>
      </div>

      <div 
        ref={containerRef}
        onClick={handleContainerClick}
        className="relative w-full h-80 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] overflow-hidden cursor-crosshair mb-6 shadow-inner"
      >
        <style>
          {`
            @keyframes pulse-ring {
              0% { transform: scale(0.33); opacity: 1; }
              80%, 100% { transform: scale(1.2); opacity: 0; }
            }
            .target-pulse::before {
              content: '';
              position: absolute;
              width: 200%;
              height: 200%;
              top: -50%;
              left: -50%;
              border-radius: 9999px;
              background-color: #3b82f6;
              animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
            }
          `}
        </style>

        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10 p-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <i className="fas fa-bullseye text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to test motor response?</h3>
            <p className="text-slate-500 text-sm text-center mb-8 max-w-[280px]">We'll measure your reaction consistency over 10 rapid visual stimuli.</p>
            <button 
              onClick={startGame}
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:scale-[1.03] active:scale-95"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            <div className="absolute top-6 left-6 flex gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                <span className="text-sm font-black text-slate-800">{hits}/{TOTAL_TARGETS}</span>
              </div>
              <div className="flex flex-col border-l border-slate-200 pl-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inaccurate</span>
                <span className="text-sm font-black text-slate-800">{misses}</span>
              </div>
            </div>
            
            <button
              onClick={handleTargetClick}
              className={`absolute w-14 h-14 bg-blue-600 rounded-full shadow-2xl shadow-blue-500/40 border-4 border-white transition-all duration-300 transform target-pulse ${
                targetVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
              style={{ left: targetPos.x - 28, top: targetPos.y - 28 }}
            />
          </>
        )}

        {gameState === 'finished' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 z-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6 shadow-lg"></div>
            <p className="text-slate-800 font-bold uppercase tracking-widest text-xs">Capturing performance markers...</p>
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-4 max-w-sm">
        <i className="fas fa-exclamation-triangle text-amber-500 mt-1"></i>
        <div className="text-left">
          <p className="text-[11px] font-bold text-amber-800 uppercase tracking-widest mb-1">Important Screening Disclaimer</p>
          <p className="text-[10px] leading-relaxed text-amber-700 font-medium">
            This tool is for screening purposes ONLY and is not a medical diagnosis. Performance variability can be influenced by fatigue, distractions, or screen latency.
          </p>
        </div>
      </div>
    </div>
  );
};
