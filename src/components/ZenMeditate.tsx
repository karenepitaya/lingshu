import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, HeartPulse, Hammer, CircleDot } from "lucide-react";
import { playWoodenFish, playSingingBowl } from "../utils/audio";

interface BlessingText {
  id: number;
  text: string;
  x: number;
  y: number;
}

export default function ZenMeditate() {
  // Breathing cycle state: 'inhale' | 'hold' | 'exhale'
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathProgress, setBreathProgress] = useState(0); // 0 to 4 seconds
  const [accumulatedCalm, setAccumulatedCalm] = useState(() => {
    const saved = localStorage.getItem("yiyang_accumulated_calm");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [blessings, setBlessings] = useState<BlessingText[]>([]);
  const [blessingId, setBlessingId] = useState(0);

  // Breathing loop effects
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathProgress((prev) => {
        if (prev >= 4) {
          // Switch phase
          setBreathPhase((current) => {
            if (current === "inhale") return "hold";
            if (current === "hold") return "exhale";
            return "inhale";
          });
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Sync accumulated calm
  useEffect(() => {
    localStorage.setItem("yiyang_accumulated_calm", accumulatedCalm.toString());
  }, [accumulatedCalm]);

  // Handle Wooden Fish tap
  const handleTapWoodenFish = (e: React.MouseEvent<HTMLButtonElement>) => {
    playWoodenFish();
    setAccumulatedCalm((prev) => prev + 1);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left || 60;
    const y = e.clientY - rect.top || 30;

    const phrases = [
      "身心安泰 +1",
      "神气充沛 +1",
      "俗虑消散 +1",
      "杂念摒弃 +1",
      "呼吸顺畅 +1",
      "功德无量 +1",
      "元气满盈 +1",
    ];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    const newBlessing: BlessingText = {
      id: blessingId,
      text: randomPhrase,
      x: x + (Math.random() * 40 - 20),
      y: y - 20,
    };

    setBlessings((prev) => [...prev, newBlessing]);
    setBlessingId((prev) => prev + 1);

    // Remove after 1.5s
    setTimeout(() => {
      setBlessings((prev) => prev.filter((b) => b.id !== newBlessing.id));
    }, 1500);
  };

  // Handle Singing Bowl tap
  const [isBowlRippling, setIsBowlRippling] = useState(false);
  const handleBowlTap = () => {
    playSingingBowl();
    setIsBowlRippling(true);
    setAccumulatedCalm((prev) => prev + 5);
    setTimeout(() => {
      setIsBowlRippling(false);
    }, 4500);
  };

  // Label and advice based on breathing phase
  const getBreathLabel = () => {
    switch (breathPhase) {
      case "inhale":
        return { label: "缓缓吸气", desc: "引大自然清气沉入丹田", textClass: "text-[#6B8E23]" };
      case "hold":
        return { label: "调息屏息", desc: "气血周流，温煦脏腑", textClass: "text-[#D4A373]" };
      case "exhale":
        return { label: "舒缓呼气", desc: "带走体内浊气与一日疲惫", textClass: "text-amber-700" };
    }
  };

  const breathMeta = getBreathLabel();

  return (
    <div className="bg-stone-50/80 backdrop-blur-md rounded-3xl p-6 border border-stone-100 shadow-sm transition-all duration-300">
      {/* Header section with stats */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-medium text-stone-800 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-[#6B8E23]" />
            静心防压冥想
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">调匀呼吸，摒弃心中杂念</p>
        </div>
        <div className="bg-[#6B8E23]/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-[#6B8E23]/20">
          <Sparkles className="w-3.5 h-3.5 text-[#6B8E23] animate-pulse" />
          <span className="text-xs font-medium text-[#6B8E23] tabular-nums">
            身心安然值: {accumulatedCalm}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left Side: Breathing breathing simulator */}
        <div className="bg-white/60 rounded-2xl p-6 border border-stone-100 flex flex-col items-center justify-center min-h-[300px]">
          <span className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <CircleDot className="w-3 h-3 text-[#6B8E23]" /> 4-4-4 养生息道
          </span>

          {/* Dynamic pulsing breathing container */}
          <div className="relative w-44 h-44 flex items-center justify-center my-4">
            {/* Background pulsating ripples */}
            <AnimatePresence>
              {breathPhase === "inhale" && (
                <motion.div
                  className="absolute inset-0 bg-[#6B8E23]/10 rounded-full"
                  initial={{ scale: 0.9, opacity: 0.2 }}
                  animate={{ scale: 1.3, opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 4, ease: "linear" }}
                />
              )}
              {breathPhase === "exhale" && (
                <motion.div
                  className="absolute inset-0 bg-amber-200/20 rounded-full"
                  initial={{ scale: 1.3, opacity: 0.6 }}
                  animate={{ scale: 0.9, opacity: 0.1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 4, ease: "linear" }}
                />
              )}
              {breathPhase === "hold" && (
                <motion.div
                  className="absolute inset-0 bg-[#D4A373]/10 rounded-full scale-110 border border-[#D4A373]/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                />
              )}
            </AnimatePresence>

            {/* Core breathing ball */}
            <motion.div
              className={`w-32 h-32 rounded-full flex flex-col items-center justify-center text-white font-medium shadow-inner transition-colors duration-1000 ${
                breathPhase === "inhale"
                  ? "bg-[#6B8E23]"
                  : breathPhase === "hold"
                  ? "bg-[#D4A373]"
                  : "bg-amber-600"
              }`}
              animate={{
                scale: breathPhase === "inhale" ? 1.15 : breathPhase === "hold" ? 1.15 : 0.9,
              }}
              transition={{ duration: 4, ease: "linear" }}
            >
              <div className="text-lg font-medium tracking-wide">{breathMeta.label}</div>
              <div className="text-2xl font-semibold mt-1 tabular-nums">{4 - breathProgress}s</div>
            </motion.div>
          </div>

          <div className="text-center mt-3">
            <h3 className={`text-base font-semibold ${breathMeta.textClass} transition-colors duration-500`}>
              {breathMeta.desc}
            </h3>
            <p className="text-xs text-stone-400 mt-1 max-w-[240px]">
              闭目两腮微收，气沉下焦，职场久坐或视听干涩时轻柔吐纳，能迅速调和阴阳气血。
            </p>
          </div>
        </div>

        {/* Right Side: Electronic stress-killers: Wood-fish and Singing bowl */}
        <div className="flex flex-col gap-4">
          {/* Wooden Fish Container */}
          <div className="bg-white/60 p-5 rounded-2xl border border-stone-100 relative overflow-hidden flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                木鱼静心
              </span>
              <p className="text-[11px] text-stone-400">点击木鱼敲击 驱散办公室烦躁</p>
            </div>

            <button
              id="wooden-fish-btn"
              onClick={handleTapWoodenFish}
              className="relative w-36 h-36 focus:outline-none transition-transform duration-75 active:scale-95 group focus:ring-0"
              aria-label="叩击木鱼"
            >
              {/* Floating phrases */}
              <AnimatePresence>
                {blessings.map((b) => (
                  <motion.span
                    key={b.id}
                    initial={{ opacity: 1, y: b.y, scale: 0.9 }}
                    animate={{ opacity: 0, y: b.y - 65, scale: 1.15 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute text-stone-700/90 font-medium text-sm pointer-events-none drop-shadow-sm whitespace-nowrap"
                    style={{ left: b.x }}
                  >
                    {b.text}
                  </motion.span>
                ))}
              </AnimatePresence>

              {/* Wooden Fish SVG Illustration */}
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full text-stone-700 hover:text-stone-600 fill-current drop-shadow-md cursor-pointer transition-colors"
              >
                {/* Custom Stylized Chinese Wooden Fish (木鱼) Design */}
                <path d="M 50 15 C 30 15, 15 28, 15 50 C 15 72, 30 85, 50 85 C 65 85, 82 78, 85 64 C 88 50, 88 40, 82 28 C 76 18, 65 15, 50 15 Z M 50 22 C 60 22, 68 25, 75 32 C 81 39, 81 48, 79 56 C 77 64, 68 78, 50 78 C 35 78, 22 68, 22 50 C 22 32, 35 22, 50 22 Z" />
                <path d="M 32 50 C 32 45, 40 40, 50 40 C 60 40, 68 45, 68 50 C 68 55, 60 60, 50 60 C 40 60, 32 55, 32 50 Z" className="text-stone-400/30" />
                <circle cx="50" cy="50" r="10" className="text-stone-300" />
                {/* Fishes scales decorative markings */}
                <path d="M 38 48 Q 50 42 62 48" fill="none" stroke="#e7e5e4" strokeWidth="2" />
                <path d="M 36 53 Q 50 48 64 53" fill="none" stroke="#e7e5e4" strokeWidth="2" />
                {/* Wood hammer mallet dynamic accent */}
                <path d="M 78 72 L 88 82 M 85 79 A 4 4 0 1 1 89 75" fill="none" stroke="#78716c" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Tibetan Singing Bowl Container */}
          <div className="bg-white/60 p-5 rounded-2xl border border-stone-100 flex flex-col items-center justify-between relative overflow-hidden">
            <div className="w-full flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-[#D4A373] bg-[#D4A373]/10 px-2 py-0.5 rounded-md">
                磬罄颂钵
              </span>
              <p className="text-[11px] text-stone-400">击打颂钵 体验多维电声音周</p>
            </div>

            <div className="relative flex items-center justify-center my-4 h-24">
              {/* Resonance ripple animation effects */}
              {isBowlRippling && (
                <>
                  <motion.div
                    className="absolute w-20 h-20 rounded-full border-2 border-[#D4A373]/40"
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 2.8, opacity: 0 }}
                    transition={{ duration: 4.5, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute w-20 h-20 rounded-full border border-[#D4A373]/20"
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 3.8, opacity: 0 }}
                    transition={{ duration: 3.5, delay: 0.5, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute w-20 h-20 rounded-full border border-[#D4A373]/10"
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 4.8, opacity: 0 }}
                    transition={{ duration: 2.5, delay: 1, ease: "easeOut" }}
                  />
                </>
              )}

              {/* Bowl button */}
              <button
                id="tibetan-bowl-btn"
                onClick={handleBowlTap}
                className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center bg-stone-100 hover:bg-stone-50 border-4 border-[#D4A373]/30 transition-shadow active:scale-95 duration-150 ${
                  isBowlRippling ? "shadow-lg shadow-[#D4A373]/20 border-[#D4A373]" : "shadow-sm"
                }`}
              >
                <div className="flex flex-col items-center">
                  {/* Bowl Graphic Icon */}
                  <span className="text-3xl filter drop-shadow">🥣</span>
                  <span className="text-[10px] font-medium text-stone-500 mt-1">敲击安神</span>
                </div>
              </button>
            </div>

            <p className="text-center text-[11px] text-stone-400 max-w-[210px]">
              {isBowlRippling ? "颂钵余音舒缓，轻阖双目..." : "合成高纯正弦和波，舒缓疲惫神经气机，促进深度睡眠"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
