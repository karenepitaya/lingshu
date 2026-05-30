import React, { useState, useEffect } from "react";
import { Leaf, Eye, Sun, Moon, ArrowLeft, Landmark } from "lucide-react";
import { ModuleType } from "./types";
import CategorySelector from "./components/CategorySelector";
import VoiceConsultant from "./components/VoiceConsultant";
import QuickInspirations from "./components/QuickInspirations";
import FortunePreloader from "./components/FortunePreloader";
import { AnimatePresence, motion } from "motion/react";

// @ts-ignore
import rangerBg from "./assets/images/mystic_forest_1780074216903.png";

export default function App() {
  // Fortune Drawing interactive preloader state
  const [hasLoadedFortune, setHasLoadedFortune] = useState(false);

  // Current active smart agent module (initially null for clean gate entry option)
  const [activeModule, setActiveModule] = useState<ModuleType | null>(null);

  // Lifted prompt to populate VoiceConsultant Chat when clock/inspiration is clicked
  const [externalPrompt, setExternalPrompt] = useState("");
  
  // Accessibility: Elderly large font toggle (长辈大字关怀模式)
  const [isLargeFont, setIsLargeFont] = useState(false);

  // Ambient Theme: Day vs Night system
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qi_dark_mode");
      return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  // Track assistant text streaming to withhold showing inspirations until completed
  const [isChatStreaming, setIsChatStreaming] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("qi_dark_mode", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const handleSelectInspiration = (text: string) => {
    setExternalPrompt(text);
  };

  const clearExternalPrompt = () => {
    setExternalPrompt("");
  };

  return (
    <>
      <AnimatePresence>
        {!hasLoadedFortune && (
          <FortunePreloader
            onComplete={() => setHasLoadedFortune(true)}
            isLargeFont={isLargeFont}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>

      <div 
        className={`min-h-screen flex flex-col transition-all duration-350 relative overflow-x-hidden ${
          isDarkMode ? "dark text-stone-100" : "text-stone-800"
        } ${
          isLargeFont ? "font-sans text-base leading-relaxed" : "font-sans text-xs leading-normal"
        }`}
        style={{
          backgroundImage: `url(${rangerBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* Dynamic Fog Mist Overlay supporting Day and Night states */}
        <div 
          className={`absolute inset-0 transition-all duration-1000 z-0 ${
            isDarkMode 
              ? "bg-gradient-to-b from-stone-950/65 via-[#030f0a]/94 to-[#020b07]/97 backdrop-blur-[9px]" 
              : "bg-gradient-to-b from-white/30 via-[#edf5f0]/88 to-[#e4eff1]/93 backdrop-blur-[5px]"
          }`} 
        />

        {/* Visual Ambient Qi Glow Nodes */}
        <div className="absolute top-[-10%] left-[-5%] w-[550px] h-[550px] rounded-full bg-emerald-700/10 blur-[130px] pointer-events-none z-0" />
        <div className="absolute bottom-[15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none z-0" />

        {hasLoadedFortune && (
          <>
            {/* Main Top Header Navigation */}
            <header className={`sticky top-0 z-30 transition-all border-b duration-300 backdrop-blur-xl max-w-7xl mx-auto w-full rounded-b-2xl ${
          isDarkMode 
            ? "bg-[#04120ca2]/65 border-white/5 text-stone-100 shadow-sm" 
            : "bg-white/45 border-white/20 text-stone-900 shadow-sm"
        } ${
          isLargeFont ? "py-4 md:py-4.5" : "py-2.5"
        }`}>
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center flex-wrap gap-4 relative z-10">
            
            {/* Brand Logo Block */}
            <div className="flex items-center gap-3">
              <div 
                onClick={() => setActiveModule(null)}
                className={`bg-emerald-700 rounded-[14px] flex items-center justify-center text-white shadow-md shadow-emerald-900/10 font-bold transition-all hover:rotate-6 cursor-pointer transform hover:scale-105 ${
                isLargeFont ? "w-11 h-11 text-2xl" : "w-9 h-9 text-lg"
              }`}>
                🍃
              </div>
              <div className="cursor-pointer" onClick={() => setActiveModule(null)}>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`font-black tracking-tight ${
                    isDarkMode ? "text-emerald-100 font-extrabold" : "text-emerald-900"
                  } ${
                    isLargeFont ? "text-xl md:text-2xl" : "text-base"
                  }`}>
                    灵枢阁
                  </span>
                  <span className={`font-black rounded-full border ${
                    isDarkMode 
                      ? "bg-emerald-950/50 text-emerald-300 border-emerald-800/40 text-[9px] px-2 py-0.5" 
                      : "bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] px-2 py-0.5"
                  } ${
                    isLargeFont ? "text-xs px-3 py-1" : ""
                  }`}>
                    五觉智愈
                  </span>
                </div>
                <p className={`font-bold tracking-wide mt-0.5 ${
                  isDarkMode ? "text-emerald-100/40" : "text-stone-400"
                } ${
                  isLargeFont ? "text-xs" : "text-[9px]"
                }`}>
                  十二时辰律动 • AI 中医温和调养 • 顺息道气仪
                </p>
              </div>
            </div>

            {/* Interaction controls block */}
            <div className="flex items-center gap-2">
              
              {/* Day / Night system toggle button */}
              <button
                id="btn-day-night-toggle"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`transition-all flex items-center gap-1.5 border border-dashed cursor-pointer hover:scale-105 active:scale-95 ${
                  isDarkMode 
                    ? "bg-emerald-950/60 hover:bg-emerald-900/70 text-amber-300 border-emerald-800" 
                    : "bg-white hover:bg-stone-50 text-stone-600 border-emerald-200"
                } ${
                  isLargeFont ? "p-3 px-4 rounded-[18px] text-[13px] font-black" : "p-1.5 px-3 rounded-2xl text-[10px] font-bold"
                }`}
                title={isDarkMode ? "当前为「广寒夜色」模式，点击切换为「金乌白昼」" : "当前为「金乌白昼」模式，点击切换为「广寒夜色」"}
              >
                {isDarkMode ? <Moon className={isLargeFont ? "w-4.5 h-4.5" : "w-3.5 h-3.5"} /> : <Sun className={isLargeFont ? "w-4.5 h-4.5" : "w-3.5 h-3.5"} />}
                <span>{isDarkMode ? "夜色琼雾" : "金乌晨曦"}</span>
              </button>

              {/* Elderly Mode switch Button */}
              <button
                id="btn-large-font-toggle"
                onClick={() => setIsLargeFont(!isLargeFont)}
                className={`font-black transition-all flex items-center gap-1.5 border cursor-pointer hover:scale-105 active:scale-95 ${
                  isLargeFont
                    ? "bg-emerald-800 hover:bg-emerald-700 text-white border-emerald-800 shadow-sm p-3 px-4 rounded-[20px] text-sm"
                    : "bg-white hover:bg-stone-50 text-stone-600 border-emerald-100 p-1.5 px-3 rounded-[16px] text-xs"
                }`}
                title="切换到大字长辈关怀模式，字形丰满，利于视力保护"
              >
                <Eye className={isLargeFont ? "w-4.5 h-4.5" : "w-3.5 h-3.5"} />
                <span>{isLargeFont ? "标准小字" : "长辈大字关怀"}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Application Content Container */}
        <main className={`max-w-7xl mx-auto px-4 relative z-10 flex-1 w-full flex flex-col transition-all duration-300 ${
          isLargeFont ? "py-8 md:py-10 gap-10" : "py-6 md:py-8 gap-6"
        }`}>
          
          <AnimatePresence mode="wait">
            
            {/* CASE 1: INITIAL PORTAL GATEWAY VIEW (No selected agent) */}
            {activeModule === null ? (
              <motion.div
                key="landing-portal"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="flex flex-col items-center justify-center pt-8 pb-14 w-full "
              >
                <div className="text-center flex flex-col items-center justify-center shrink-0 max-w-2xl mx-auto mb-8">
                  {/* Big Leaf Icon of Eastern Divinity */}
                  <div className="flex items-center justify-center gap-2 mb-4 animate-[bounce_3s_infinite_alternate]">
                    <div className="w-16 h-16 rounded-full bg-emerald-700/10 border-2 border-emerald-500/30 flex items-center justify-center shadow-lg">
                      <Leaf className={`text-emerald-500 font-black tracking-widest ${
                        isLargeFont ? "w-9 h-9" : "w-7 h-7"
                      }`} />
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className={`font-black tracking-tight select-none mb-4 ${
                    isDarkMode ? "text-emerald-50 bg-clip-text text-transparent bg-gradient-to-tr from-emerald-100 via-emerald-100 to-amber-200" : "text-emerald-950"
                  } ${
                    isLargeFont ? "text-4xl md:text-5.55xl" : "text-3xl md:text-4.5xl font-black"
                  }`}>
                    灵枢·五觉养生阁
                  </h1>

                  {/* Descriptions */}
                  <div className={`p-1 w-full max-w-lg mb-6 leading-relaxed text-center`}>
                    <p className={`font-black tracking-wider leading-relaxed ${
                      isDarkMode ? "text-emerald-300/80" : "text-emerald-800"
                    } ${
                      isLargeFont ? "text-lg" : "text-sm"
                    }`}>
                      🍂 顺时养生，调和身心。
                    </p>
                    <p 
                      className={`font-extrabold tracking-wide leading-relaxed rounded-[24px] border transition-all duration-300 text-left max-w-lg mx-auto shadow-sm ${
                        isDarkMode 
                          ? "bg-stone-950/45 backdrop-blur-md border-white/[0.05] text-stone-200" 
                          : "bg-white/45 backdrop-blur-md border-white/40 text-stone-800"
                      } ${
                        isLargeFont ? "text-sm p-6.5 mt-5 leading-loose" : "text-xs p-5 mt-3.5"
                      }`}
                    >
                      <blockquote className={`border-l-4 pl-4 italic ${
                        isDarkMode ? "border-emerald-500 text-stone-200" : "border-emerald-600 text-stone-700"
                      } ${isLargeFont ? "text-base leading-relaxed" : "text-sm leading-relaxed"}`}>
                        这里为您准备了五大方向的中医健康助手。请在下方点击选择一个
                        <span className={isDarkMode ? "text-amber-300 font-black not-italic" : "text-emerald-800 font-black not-italic"}> 专属健康顾问 </span>
                        ，开启针对
                        <span className={isDarkMode ? "text-emerald-300 font-black not-italic" : "text-emerald-700 font-black not-italic"}> 脾胃、经络、运动 </span>
                        、以及
                        <span className={isDarkMode ? "text-pink-300 font-black not-italic" : "text-pink-700 font-black not-italic"}> 情志心理 </span>
                        的个性化调理方案。
                      </blockquote>
                    </p>
                  </div>
                </div>

                {/* 5 Cards Selection Portal Frame */}
                <div 
                  className="w-full max-w-5xl py-6 bg-white/[0.02] dark:bg-black/[0.1] backdrop-blur-[4px] rounded-[42px] px-4 md:px-8 shadow-inner"
                  style={{ borderStyle: "none" }}
                >
                  <CategorySelector 
                    activeModule={activeModule} 
                    onSelectModule={(mod) => {
                      setActiveModule(mod);
                      setIsChatStreaming(true); // Initiate typing sequence blocker immediately on chosen
                    }} 
                    isLargeFont={isLargeFont}
                    isDarkMode={isDarkMode}
                  />
                </div>

                {/* Ambient Decorative Signpost */}
                <div className="mt-14 flex items-center gap-2 text-[10px] tracking-widest font-extrabold uppercase pointer-events-none text-stone-500/50">
                  <Landmark className="w-4 h-4" />
                  <span>五脏调和，元气充盈 • 静候启程</span>
                </div>
              </motion.div>
            ) : (
              
              // CASE 2: ACTIVE AGENT CONSOLE VIEW (Selected specific module)
              <motion.div
                key="active-agent-dashboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex flex-col gap-6 w-full"
              >
                
                {/* Active Sub-Bar containing Back to gate and active title, styled as glassmorphic with ultra-soft borders */}
                <div className="flex justify-between items-center bg-white/20 dark:bg-stone-900/15 border border-white/20 dark:border-white/5 backdrop-blur-xl p-3.5 rounded-[24px] max-w-5xl mx-auto w-full transition-all duration-300">
                  
                  {/* Gate Return Button */}
                  <button 
                    onClick={() => {
                      setActiveModule(null);
                      setIsChatStreaming(false);
                    }}
                    className={`flex items-center gap-1.5 border border-transparent font-black shadow-xs hover:shadow-md cursor-pointer rounded-xl transition-all duration-200 active:scale-95 group text-left ${
                      isDarkMode 
                        ? "bg-emerald-950/60 text-emerald-300 border-white/5 hover:bg-emerald-900/40" 
                        : "bg-emerald-50/65 text-emerald-800 border-white/40 hover:bg-emerald-100/60"
                    } ${
                      isLargeFont ? "p-3 px-5 text-sm" : "p-2 px-3.5 text-xs"
                    }`}
                  >
                    <ArrowLeft className={`transition-transform group-hover:-translate-x-0.5 ${isLargeFont ? "w-5 h-5" : "w-4 h-4"}`} />
                    <span>返回首页</span>
                  </button>

                  <span className={`font-black tracking-wider ${
                    isDarkMode ? "text-emerald-300" : "text-emerald-800"
                  } ${
                    isLargeFont ? "text-sm pr-2" : "text-xs pr-1"
                  }`}>
                    🍂 灵枢·五觉养生 • {activeModule === "diet" ? "应季饮食" : activeModule === "exercise" ? "导引运动" : activeModule === "mental" ? "宁神心理" : activeModule === "wellness" ? "时穴养生" : "随缘彩蛋"}
                  </span>
                </div>

                {/* Suggestion list sits gracefully at top (BEFORE CHATBOX), loading dynamically only AFTER stream completes */}
                <div className="max-w-5xl mx-auto w-full">
                  <AnimatePresence mode="wait">
                    {!isChatStreaming ? (
                      <motion.div
                        key="suggestions-box"
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.35 }}
                      >
                        <QuickInspirations
                          activeModule={activeModule}
                          onSelectInspiration={handleSelectInspiration}
                          isLargeFont={isLargeFont}
                          isDarkMode={isDarkMode}
                        />
                      </motion.div>
                    ) : (
                      <motion.p 
                        key="streaming-hint"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.55 }}
                        exit={{ opacity: 0 }}
                        className={`text-center font-bold tracking-widest text-stone-500 italic ${
                          isLargeFont ? "text-xs pt-1.5" : "text-[9.5px]"
                        }`}
                      >
                        ☕ 顾问正在整理思路，回复完成后将为您推荐更多养生话题
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Central Focus Active Chat Workspace */}
                <div className="max-w-5xl mx-auto w-full relative z-10" id="smart-chat-window">
                  <VoiceConsultant
                    activeModule={activeModule}
                    externalPrompt={externalPrompt}
                    clearExternalPrompt={clearExternalPrompt}
                    isLargeFont={isLargeFont}
                    isDarkMode={isDarkMode}
                    onStreamingChange={(streaming) => setIsChatStreaming(streaming)}
                  />
                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </main>

        {/* Global Footer and disclosures */}
        <footer className={`border-t relative z-10 text-center transition-all duration-300 backdrop-blur-xl max-w-7xl mx-auto w-full rounded-t-2xl mt-16 ${
          isDarkMode
            ? "bg-stone-950/50 border-emerald-950 text-emerald-100/40"
            : "bg-[#edf5f0]/60 border-emerald-100/50 text-emerald-800/80"
        } ${
          isLargeFont ? "py-10" : "py-6 mt-12"
        }`}>
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className={`font-black ${isDarkMode ? "text-emerald-100" : "text-emerald-950"} ${isLargeFont ? "text-lg" : "text-sm"}`}>☯️ 灵枢·五觉养生阁</span>
                <span className={`px-2 py-0.5 rounded font-bold ${
                  isDarkMode ? "bg-emerald-950/80 text-emerald-300" : "bg-emerald-100 text-emerald-800"
                } ${isLargeFont ? "text-xs" : "text-[9px]"}`}>
                  顺应时节，科学养生
                </span>
              </div>
              <p className={`leading-relaxed mt-2.5 font-bold ${isLargeFont ? "text-sm leading-loose" : "text-[10px]"}`}>
                温馨提示：本平台推荐的穴位、运动建议、饮食方案均参考自中医典籍与养生理论。
                AI 健康对话不构成专业医疗诊断或处方。若有身体不适，请及时前往正规医疗机构就诊。祝您健康！
              </p>
            </div>
            <div className="text-center md:text-right shrink-0">
              <span className={`font-black px-4 py-2 rounded-full border border-dashed ${
                isDarkMode
                  ? "bg-[#11231a] text-emerald-200 border-emerald-800/40"
                  : "bg-white text-emerald-800 border-emerald-200/80"
              } ${isLargeFont ? "text-sm" : "text-[10px]"}`}>
                颐养阁 © 2026 • 调顺经络，百骸和畅
              </span>
            </div>
          </div>
        </footer>
          </>
        )}

      </div>
    </>
  );
}
