import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { SHICHEN_DATA, getShichenByTime } from "../data/meridians";
import { ShichenInfo } from "../types";
import { Clock, BookOpen, Coffee, Flame, RefreshCw, Send, Sparkles } from "lucide-react";

interface MeridianClockProps {
  onAskGemini: (prompt: string) => void;
}

export default function MeridianClock({ onAskGemini }: MeridianClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedShichen, setSelectedShichen] = useState<ShichenInfo>(() => getShichenByTime(new Date()));

  // Clock ticks
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentShichen = getShichenByTime(currentTime);

  // Quick prompt generator for the AI Assistant based on the hour
  const handleAskAboutShichen = (shichen: ShichenInfo) => {
    const prompt = `我想咨询关于中医时辰养生的问题。现在是【${shichen.name}】，对应【${shichen.organ}】。\n时辰状态：${shichen.status}\n养生建议：${shichen.advice}\n时辰推荐药茶是“${shichen.herbalTea.name}”，推荐养生穴位是“${shichen.acupoint.name}”。\n请大医颐养详细解答一下在这个时辰，像我这样的久坐职场人士/中老年群体应当如何科学调理？有什么需要注意的饮食禁忌和保健操指引吗？`;
    onAskGemini(prompt);
  };

  return (
    <div className="bg-stone-50/80 backdrop-blur-md rounded-3xl p-6 border border-stone-100 shadow-sm transition-all duration-300">
      {/* Clock Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl font-medium text-stone-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#6B8E23]" />
            子午流注·十二时辰养生仪
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">顺应十二时辰自然规律，通经活络保养气血</p>
        </div>
        
        {/* Live clock bubble */}
        <div className="bg-white/90 border border-stone-200/80 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-xs">
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-stone-400">
              当前时辰：{currentShichen.name} • {currentShichen.organ.split("(")[0].trim()}
            </span>
            <span className="text-lg font-bold text-stone-700 tabular-nums">
              {currentTime.toLocaleTimeString("zh-CN", { hour12: false })}
            </span>
          </div>
          <button 
            id="sync-time-btn"
            onClick={() => setSelectedShichen(getShichenByTime(new Date()))}
            title="回到当前时辰"
            className="p-1.5 hover:bg-stone-100 rounded-lg text-[#6B8E23] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Shichen circular navigation dial */}
      <div className="mb-6 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex space-x-2 pb-2 min-w-max px-1">
          {SHICHEN_DATA.map((shichen) => {
            const isCurrent = shichen.name === currentShichen.name;
            const isSelected = shichen.name === selectedShichen.name;

            return (
              <button
                key={shichen.name}
                id={`btn-shichen-${shichen.name}`}
                onClick={() => setSelectedShichen(shichen)}
                className={`relative px-4 py-3 rounded-2xl flex flex-col items-center min-w-[85px] transition-all focus:outline-none focus:ring-0 ${
                  isSelected
                    ? "bg-[#6B8E23] text-white shadow-md shadow-[#6B8E23]/20"
                    : isCurrent
                    ? "bg-[#6B8E23]/10 border border-[#6B8E23]/40 text-stone-800"
                    : "bg-white hover:bg-stone-100/50 border border-stone-100 text-stone-600"
                }`}
              >
                {/* Active Live Dot */}
                {isCurrent && (
                  <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                    isSelected ? "bg-white" : "bg-[#6B8E23]"
                  } animate-ping`} />
                )}
                
                <span className="text-sm font-bold">{shichen.name}</span>
                <span className="text-[10px] opacity-80 font-medium tracking-tighter mt-0.5">{shichen.timeRange.replace(" ", "")}</span>
                <span className={`text-[10px] mt-1 font-semibold truncate max-w-[70px] ${
                  isSelected ? "text-white/90" : "text-stone-400"
                }`}>
                  {shichen.organ.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Hour Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Column 1: Core Shichen Meridian Card Info */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-stone-100/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-[#6B8E23]/10 text-[#6B8E23] text-xs font-bold px-3 py-1 rounded-full border border-[#6B8E23]/20">
                时辰详解
              </span>
              {selectedShichen.name === currentShichen.name && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> 照临当前
                </span>
              )}
            </div>

            <h3 className="text-2xl font-bold text-stone-800 flex items-baseline gap-1.5">
              <span>{selectedShichen.name}</span>
              <span className="text-sm font-semibold text-stone-400">({selectedShichen.timeRange})</span>
            </h3>

            <div className="mt-3 text-stone-700">
              <p className="text-sm font-semibold text-stone-500">主宰经络:</p>
              <p className="text-base font-bold text-[#6B8E23] mt-0.5">{selectedShichen.organ}</p>
            </div>

            <div className="mt-4 bg-stone-50 p-3 rounded-xl border border-stone-100/60">
              <p className="text-xs font-medium text-stone-400">气机升降与规律:</p>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed font-medium">
                {selectedShichen.status}
              </p>
            </div>
            
            <p className="text-sm font-bold text-stone-800 bg-amber-50 border border-amber-100 p-3 rounded-xl mt-4">
              🎯 黄金律法: {selectedShichen.advice}
            </p>
          </div>

          {/* Ask AI Trigger Button */}
          <button
            id={`ask-ai-shichen-${selectedShichen.name}`}
            onClick={() => handleAskAboutShichen(selectedShichen)}
            className="mt-6 w-full bg-[#6B8E23] hover:bg-[#5b7a1d] text-white text-xs font-bold py-3 px-4 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            咨询大医颐养此特定调理
          </button>
        </div>

        {/* Column 2: Detailed herbal recipes & Acupoints */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Subcard 1: Hour Tea Recipe */}
          <div className="bg-white p-5 rounded-2xl border border-stone-100/60 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-3 flex flex-col items-center justify-center bg-amber-50/70 border border-amber-100/80 p-3 rounded-xl">
              <span className="text-3xl">🍵</span>
              <span className="text-xs font-bold text-[#D4A373] mt-1.5 flex items-center gap-1">
                <Coffee className="w-3 h-3" /> 时辰药茶
              </span>
            </div>
            <div className="sm:col-span-9">
              <h4 className="text-base font-bold text-stone-800">
                时辰推荐配方：{selectedShichen.herbalTea.name}
              </h4>
              <p className="text-xs font-medium text-stone-500 mt-1">
                <span className="font-semibold text-[#D4A373]">药材配伍:</span> {selectedShichen.herbalTea.ingredients}
              </p>
              <p className="text-xs text-stone-600 mt-2 font-medium leading-relaxed bg-stone-50 p-2.5 rounded-lg">
                <span className="font-semibold text-stone-700">调理机理:</span> {selectedShichen.herbalTea.effect}
              </p>
            </div>
          </div>

          {/* Subcard 2: Acupoint Guide */}
          <div className="bg-white p-5 rounded-2xl border border-stone-100/60 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-3 flex flex-col items-center justify-center bg-[#6B8E23]/10 border border-[#6B8E23]/20 p-3 rounded-xl">
              <span className="text-3xl">📍</span>
              <span className="text-xs font-bold text-[#6B8E23] mt-1.5 flex items-center gap-1">
                <Flame className="w-3 h-3 animate-pulse" /> 舒压大穴
              </span>
            </div>
            <div className="sm:col-span-9">
              <h4 className="text-base font-bold text-stone-800">
                推荐点揉：{selectedShichen.acupoint.name}
              </h4>
              <p className="text-xs font-medium text-stone-500 mt-1">
                <span className="font-semibold text-[#6B8E23]">精准定位:</span> {selectedShichen.acupoint.location}
              </p>
              <p className="text-xs text-stone-600 mt-2 font-medium leading-relaxed bg-stone-50 p-2.5 rounded-lg">
                <span className="font-semibold text-stone-700">拍揉功效:</span> {selectedShichen.acupoint.benefits}
              </p>
            </div>
          </div>

          {/* Subcard 3: General tips checklist */}
          <div className="bg-stone-100/40 p-4 rounded-2xl border border-stone-200/50">
            <p className="text-xs font-bold text-stone-600 flex items-center gap-1 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-[#6B8E23]" />
              起居日常调养要点 (Tips)
            </p>
            <ul className="space-y-1.5">
              {selectedShichen.tips.map((tip, idx) => (
                <li key={idx} className="text-xs text-stone-600 flex items-start gap-1.5 font-medium leading-relaxed">
                  <span className="text-[#6B8E23] mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
