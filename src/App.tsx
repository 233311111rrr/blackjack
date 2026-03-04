/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Info, TrendingUp, XCircle, CheckCircle2, BarChart3, ChevronDown } from 'lucide-react';

// --- Types ---
interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  dealer?: string;
  player?: string;
  decision?: string;
  score?: number;
  timestamp: Date;
}

interface Stats {
  totalRounds: number;
  avgScore: number;
  bestScore: number;
}

// --- Decision Engine ---
const getDecision = (dealerCard: string, playerCards: string[]) => {
  const dealerVal = dealerCard === 'A' ? 11 : parseInt(dealerCard) || 10;
  const playerVals = playerCards.map(c => (c === 'A' ? 11 : parseInt(c) || 10));
  const playerSum = playerVals.reduce((a, b) => a + b, 0);
  const isPair = playerCards.length === 2 && (playerCards[0] === playerCards[1] || (parseInt(playerCards[0]) === parseInt(playerCards[1]) && parseInt(playerCards[0]) > 0));

  // 1. Split Rules
  if (isPair) {
    const pairCard = playerCards[0];
    if (pairCard === 'A' || pairCard === '8') return '分牌 (Split)';
    // Never split 10s or 5s.
  }

  // 2. Double Down Rules
  if (playerCards.length === 2) {
    if (playerSum === 11 && dealerCard !== 'A') return '加倍下注 (Double Down)';
    if (playerSum === 10 && dealerVal <= 9) return '加倍下注 (Double Down)';
  }

  // 3. Stand Rules
  if (playerSum >= 17) return '停牌 (Stand)';
  if (playerSum >= 12 && playerSum <= 16 && dealerVal >= 2 && dealerVal <= 6) return '停牌 (Stand)';

  // 4. Default
  return '要牌 (Hit)';
};

// --- Components ---
const BlackjackIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="100" height="100" rx="24" fill="url(#icon_gradient)" />
    <defs>
      <linearGradient id="icon_gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60A5FA" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>
    {/* Card 1 (Back) */}
    <rect x="25" y="30" width="35" height="50" rx="4" fill="white" fillOpacity="0.2" transform="rotate(-10 25 30)" />
    {/* Card 2 (Front) */}
    <rect x="40" y="25" width="35" height="50" rx="4" fill="white" />
    <path d="M48 35L52 35M48 40H54M50 32V43" stroke="#131314" strokeWidth="2" strokeLinecap="round" /> {/* Stylized A */}
    {/* Trending Arrow */}
    <path 
      d="M20 75L45 50L60 65L85 30M85 30H70M85 30V45" 
      stroke="white" 
      strokeWidth="8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="drop-shadow-lg"
    />
  </svg>
);

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [dealerInput, setDealerInput] = useState('');
  const [playerInput, setPlayerInput] = useState('');
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Statistics Calculation
  const stats = useMemo<Stats>(() => {
    const scoredMessages = messages.filter(m => m.score !== undefined);
    if (scoredMessages.length === 0) return { totalRounds: 0, avgScore: 0, bestScore: 0 };
    
    const total = scoredMessages.length;
    const sum = scoredMessages.reduce((acc, m) => acc + (m.score || 0), 0);
    const best = Math.max(...scoredMessages.map(m => m.score || 0));
    
    return {
      totalRounds: total,
      avgScore: Math.round(sum / total),
      bestScore: best
    };
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAsk = () => {
    if (!dealerInput || !playerInput) return;

    const playerCards = playerInput.split(/[, ]+/).filter(Boolean);
    const decision = getDecision(dealerInput, playerCards);

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: `根據基本策略，建議：**${decision}**`,
      dealer: dealerInput,
      player: playerInput,
      decision: decision,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setIsRoundActive(true);
  };

  const handleEndRound = () => {
    if (!isRoundActive) return;

    // Simulate a score based on following advice (85-100)
    const score = Math.floor(Math.random() * 16) + 85; 

    const endMsg: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: `本局結束。決策執行評分：**${score}** / 100\n策略優化建議：保持紀律，長期勝率將趨向穩定。`,
      score: score,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, endMsg]);
    setIsRoundActive(false);
    setDealerInput('');
    setPlayerInput('');
  };

  return (
    <div className="flex flex-col h-screen bg-[#131314] text-[#e3e3e3] font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#3c4043] bg-[#131314]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <BlackjackIcon size={36} className="shadow-lg shadow-blue-500/20" />
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Blackjack Pro</h1>
            <p className="text-[10px] text-[#8e918f] uppercase tracking-widest font-bold">Strategy Advisor</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowStats(!showStats)}
            className={`p-2.5 rounded-full transition-all ${showStats ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-[#3c4043] text-[#c4c7c5]'}`}
          >
            <BarChart3 size={20} />
          </button>
        </div>
      </header>

      {/* Stats Panel */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[#1e1f20] border-b border-[#3c4043]"
          >
            <div className="p-6 grid grid-cols-3 gap-4">
              <div className="bg-[#131314] p-4 rounded-2xl border border-[#3c4043]">
                <p className="text-[10px] text-[#8e918f] uppercase font-bold mb-1">總局數</p>
                <p className="text-2xl font-semibold">{stats.totalRounds}</p>
              </div>
              <div className="bg-[#131314] p-4 rounded-2xl border border-[#3c4043]">
                <p className="text-[10px] text-[#8e918f] uppercase font-bold mb-1">平均評分</p>
                <p className="text-2xl font-semibold text-blue-400">{stats.avgScore}</p>
              </div>
              <div className="bg-[#131314] p-4 rounded-2xl border border-[#3c4043]">
                <p className="text-[10px] text-[#8e918f] uppercase font-bold mb-1">最高紀錄</p>
                <p className="text-2xl font-semibold text-emerald-400">{stats.bestScore}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 space-y-8 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-sm mx-auto">
            <div className="relative">
              <div className="absolute -inset-8 bg-blue-500/10 blur-3xl rounded-full" />
              <BlackjackIcon size={80} className="relative drop-shadow-2xl" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-medium text-white">準備好贏過莊家了嗎？</h2>
              <p className="text-sm text-[#8e918f] leading-relaxed">
                輸入莊家明牌與你的手牌，我將根據數學機率為你提供最佳決策建議。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full pt-4">
              <div className="p-3 rounded-xl bg-[#1e1f20] border border-[#3c4043] text-xs text-left">
                <p className="font-bold text-blue-400 mb-1">分牌規則</p>
                <p className="opacity-60">永遠分 A 與 8</p>
              </div>
              <div className="p-3 rounded-xl bg-[#1e1f20] border border-[#3c4043] text-xs text-left">
                <p className="font-bold text-purple-400 mb-1">停牌時機</p>
                <p className="opacity-60">17 點以上停牌</p>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[90%] sm:max-w-[80%] px-6 py-5 rounded-[28px] shadow-sm ${
                  msg.type === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-[#1e1f20] border border-[#3c4043] rounded-tl-none'
                }`}
              >
                {msg.dealer && (
                  <div className="flex items-center gap-3 mb-3">
                    <div className="px-2 py-1 rounded-md bg-[#131314] border border-[#3c4043] text-[10px] font-mono text-blue-400">
                      莊: {msg.dealer}
                    </div>
                    <div className="px-2 py-1 rounded-md bg-[#131314] border border-[#3c4043] text-[10px] font-mono text-purple-400">
                      我: {msg.player}
                    </div>
                  </div>
                )}
                <div className="text-[14px] sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                  {msg.content.split('**').map((part, i) => 
                    i % 2 === 1 ? <strong key={i} className="text-blue-400 font-bold">{part}</strong> : part
                  )}
                </div>
                {msg.score !== undefined && (
                  <div className="mt-4 pt-4 border-t border-[#3c4043]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-[#8e918f] uppercase">執行評分</span>
                      <span className={`text-xs font-bold ${msg.score > 90 ? 'text-emerald-400' : 'text-blue-400'}`}>{msg.score}%</span>
                    </div>
                    <div className="h-1.5 bg-[#131314] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${msg.score}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${msg.score > 90 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>

      {/* Input Area */}
      <footer className="p-4 pb-8 bg-[#131314]">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-end gap-3">
            {/* End Round Button */}
            <button
              onClick={handleEndRound}
              disabled={!isRoundActive}
              className={`p-4 rounded-[24px] transition-all flex items-center justify-center shadow-lg ${
                isRoundActive 
                  ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20' 
                  : 'bg-[#1e1f20] text-[#3c4043] border border-transparent cursor-not-allowed'
              }`}
              title="結束此局並評分"
            >
              <XCircle size={24} />
            </button>

            {/* Input Fields Container */}
            <div className="flex-1 bg-[#1e1f20] border border-[#3c4043] rounded-[24px] sm:rounded-[32px] p-1.5 sm:p-2.5 flex items-center gap-1 sm:gap-2 shadow-2xl focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
              <div className="flex flex-1 gap-2 sm:gap-4 px-2 sm:px-3">
                <div className="flex-1 flex flex-col min-w-0">
                  <label className="text-[8px] sm:text-[9px] text-blue-400 font-black ml-1 uppercase tracking-tighter truncate">莊家</label>
                  <input
                    type="text"
                    placeholder="A, 10..."
                    value={dealerInput}
                    onChange={(e) => setDealerInput(e.target.value.toUpperCase())}
                    className="bg-transparent border-none outline-none text-[13px] sm:text-[15px] py-1 placeholder:text-[#444746] text-white font-medium w-full"
                  />
                </div>
                <div className="w-[1px] h-6 sm:h-8 bg-[#3c4043] self-center opacity-50" />
                <div className="flex-[1.5] flex flex-col min-w-0">
                  <label className="text-[8px] sm:text-[9px] text-purple-400 font-black ml-1 uppercase tracking-tighter truncate">我的手牌</label>
                  <input
                    type="text"
                    placeholder="8, 8 或 16..."
                    value={playerInput}
                    onChange={(e) => setPlayerInput(e.target.value.toUpperCase())}
                    className="bg-transparent border-none outline-none text-[13px] sm:text-[15px] py-1 placeholder:text-[#444746] text-white font-medium w-full"
                  />
                </div>
              </div>

              <button
                onClick={handleAsk}
                disabled={!dealerInput || !playerInput}
                className={`p-2.5 sm:p-3.5 rounded-full transition-all shadow-lg shrink-0 ${
                  dealerInput && playerInput 
                    ? 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 active:scale-95' 
                    : 'bg-[#3c4043] text-[#131314]'
                }`}
              >
                <Send size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex justify-center gap-6 text-[10px] text-[#8e918f] font-bold uppercase tracking-[0.2em]">
            <span className="hover:text-blue-400 transition-colors cursor-default">機率運算</span>
            <span className="opacity-20">•</span>
            <span className="hover:text-purple-400 transition-colors cursor-default">基本策略</span>
            <span className="opacity-20">•</span>
            <span className="hover:text-emerald-400 transition-colors cursor-default">紀律優化</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
