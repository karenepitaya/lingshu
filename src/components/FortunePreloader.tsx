import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Calendar, Heart, Shield, Compass, ChevronRight, Activity, Music, Volume2 } from "lucide-react";
import { gsap } from "gsap";

// @ts-ignore
import rangerBg from "../assets/images/mystic_forest_1780074216903.png";

interface FortuneSlip {
  luck: string;
  grade: string; // "上上签" | "大吉" | "福运签" | "安宁签"
  title: string;
  poem: string;
  meaning: string;
  herb: string;
  herbDetail: string;
  direction: string;
}

const CONSTANT_SLIPS: FortuneSlip[] = [
  {
    luck: "上上签 • 八脉通顺",
    grade: "上上签",
    title: "时来运会，正气浩然",
    poem: "春泥吐绿万象新，经络顺时气血匀。阁主温调一盏茶，诸疾粉碎百忧泯。",
    meaning: "今日施主身心大吉，体内正气充裕。若遇微恙，只需调顺呼吸，少食油腻。今有五觉阁大医温和护持，诸事顺心，百邪不沾。",
    herb: "人参 👑",
    herbDetail: "元气之王，固本培元，能大补元气、补脾益肺，令您整日神采飞扬。",
    direction: "今日吉时：巳时(9:00-11:00)，宜：温饮、散步半刻"
  },
  {
    luck: "大吉 • 脾胃融和",
    grade: "大吉",
    title: "胃土融暖，气化通畅",
    poem: "腹温口轻百脉安，寒湿尽退复泰然。甘草调和诸药效，浮沉尘俗心自宽。",
    meaning: "您的中焦脾胃运化正在恢复融和。今日最宜：饮一杯温热茶汤，闭目养神。少言语以聚元气，少思虑以安神气。",
    herb: "茯苓 🍃",
    herbDetail: "健脾渗湿，宁心安神。如清晨山雾消散，脾胃大开，神清气爽。",
    direction: "今日吉时：未时(13:00-15:00)，宜：空腹静坐、舒展肩膀"
  },
  {
    luck: "神旺签 • 宁神守气",
    grade: "神旺签",
    title: "神藏于心，百脉皆灵",
    poem: "深夜高卧眠安稳，晨起舒背筋骨暖。八段功成微汗出，朝霞一缕气象宽。",
    meaning: "施主气定神闲，元神内守。今日是排解焦虑、舒展筋脉的绝佳时机。顺着十二时辰作息，自然百毒不侵，体泰心平。",
    herb: "黄芪 🛡️",
    herbDetail: "补气升阳，固表止汗。化作您体表一层暖风金钟罩，阻挡外界风寒侵袭。",
    direction: "今日吉时：辰时(7:00-9:00)，宜：深深呼吸、叩齿三十六下"
  },
  {
    luck: "泰和签 • 阴阳相随",
    grade: "泰和签",
    title: "身若修竹，坚韧泰然",
    poem: "天人相应顺节令，舒筋活络通四末。安之若素宽心海，气顺功成不言多。",
    meaning: "五脏之气渐趋平衡，手脚和暖。今日若有肩颈僵酸，可在阁中查看「导引运动」随师揉按。正气存内，自然百病难藏。",
    herb: "当归 ❤️",
    herbDetail: "补血活血，调经止痛。泽润百脉气血，如春雨润物般给四肢百骸送去温和给养。",
    direction: "今日吉时：酉时(17:00-19:00)，宜：舒展腰椎、多喝一口米汤"
  }
];

interface FortunePreloaderProps {
  onComplete: () => void;
  isLargeFont: boolean;
  isDarkMode: boolean;
}

export default function FortunePreloader({ onComplete, isLargeFont, isDarkMode }: FortunePreloaderProps) {
  const [step, setStep] = useState<"greeting" | "shaking" | "revealed">("greeting");
  const [wish, setWish] = useState("");
  const [selectedSlip, setSelectedSlip] = useState<FortuneSlip>(CONSTANT_SLIPS[0]);
  const [ambientProgress, setAmbientProgress] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; size: number }[]>([]);
  
  // Refs for pristine GSAP animations
  const cylinderRef = useRef<HTMLDivElement>(null);
  const sticksRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const portalOverlayRef = useRef<HTMLDivElement>(null);

  // Sound effect triggers using browser synthesized synth voices to offer luxurious ancient aura
  const playSound = (type: "btn" | "shake" | "gong" | "portal") => {
    try {
      const isSupported = typeof window !== "undefined" && window.AudioContext || (window as any).webkitAudioContext;
      if (!isSupported) return;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (type === "btn") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      } else if (type === "shake") {
        // Fast wood rattle rattle
        for (let i = 0; i < 6; i++) {
          const t = ctx.currentTime + i * 0.12;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(180 + Math.random() * 240, t);
          gain.gain.setValueAtTime(0.04, t);
          gain.gain.exponentialRampToValueAtTime(0.005, t + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.09);
        }
      } else if (type === "gong") {
        // Deep resonating bell chime Representing Fortune Revealed
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4 middle
        osc.frequency.setValueAtTime(329.63, ctx.currentTime + 0.05); // E4 
        osc.frequency.setValueAtTime(392.00, ctx.currentTime + 0.1); // G4
        osc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.6); // C5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.9);
      } else if (type === "portal") {
        // Celestial sweep up
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.82);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.85);
      }
    } catch (e) {
      // Audio context might be restricted by user interaction policy
    }
  };

  // Organic background loading progress simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setAmbientProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const increment = Math.floor(Math.random() * 9) + 4;
        return Math.min(prev + increment, 100);
      });
    }, 110);
    return () => clearInterval(interval);
  }, []);

  // Trigger continuous wooden rattles throughout shaking state
  useEffect(() => {
    let shakeAudioInterval: any;
    if (step === "shaking") {
      playSound("shake");
      shakeAudioInterval = setInterval(() => {
        playSound("shake");
      }, 550);
    }
    return () => clearInterval(shakeAudioInterval);
  }, [step]);

  const triggerShake = () => {
    playSound("btn");
    setStep("shaking");
    
    // Pick the divine wisdom slip
    const randomIndex = Math.floor(Math.random() * CONSTANT_SLIPS.length);
    setSelectedSlip(CONSTANT_SLIPS[randomIndex]);

    // Beautiful continuous physical GSAP shaking timeline for 2.8 seconds!
    const shakeTime = 2.8;
    const cycles = 20; 

    setTimeout(() => {
      // Play a divine chime bell when fortune is revealed
      playSound("gong");
      setStep("revealed");
      createExplodingParticles();
    }, shakeTime * 1000);

    // Dynamic GSAP timeline targeting the Cylinder container
    const tl = gsap.timeline({ repeat: -1 });

    // Build recursive fast shake keyframes on the cylinder ref
    const durationPerCycle = shakeTime / cycles;
    for (let i = 0; i < cycles; i++) {
      const angle = (i % 2 === 0 ? 16 : -16) * (1 - i / cycles * 0.45); // decaying swing
      const tx = (i % 2 === 0 ? 14 : -14) * (1 - i / cycles * 0.45);
      const ty = -14 + Math.random() * -12;
      tl.to(cylinderRef.current, {
        rotation: angle,
        x: tx,
        y: ty,
        scaleY: 0.95 + Math.random() * 0.08,
        duration: durationPerCycle,
        ease: "sine.inOut"
      });
    }

    // Simultaneously, make timber slips inside shake up and down organically
    if (sticksRef.current) {
      const stickNodes = sticksRef.current.children;
      gsap.to(stickNodes, {
        y: () => -20 + Math.random() * -30,
        x: () => Math.random() * 12 - 6,
        rotation: () => -18 + Math.random() * 36,
        duration: 0.12,
        repeat: 24,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
  };

  const createExplodingParticles = () => {
    const tempParticles = Array.from({ length: 48 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 180 + 60;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        color: ["#f59e0b", "#10b981", "#fbbf24", "#34d399", "#f43f5e", "#fffbeb"][Math.floor(Math.random() * 6)],
        size: Math.random() * 9 + 4,
      };
    });
    setParticles(tempParticles);
  };

  // Exquisite GSAP Exit Transition to enter the actual webpage after taking blessing
  const handleEnterCabinet = () => {
    playSound("portal");

    if (!portalOverlayRef.current || !mainContentRef.current) {
      onComplete();
      return;
    }

    // Create a spectacular visual blast using GSAP
    const masterTimeline = gsap.timeline({
      onComplete: () => {
        onComplete();
      }
    });

    // 1. Shrink and fade the paper slip card quickly to represent spirit compression
    masterTimeline.to(mainContentRef.current, {
      scale: 0.85,
      opacity: 0,
      filter: "blur(10px)",
      duration: 0.5,
      ease: "power2.in"
    });

    // 2. Simultaneously explode the emerald energy gateway with perfect timing
    masterTimeline.to(portalOverlayRef.current, {
      scale: 45,
      opacity: 1,
      duration: 0.9,
      ease: "power4.inOut"
    }, "-=0.25");

    // 3. Expand the border glow outwards
    const energyRing = portalOverlayRef.current.querySelector(".energy-ring");
    if (energyRing) {
      masterTimeline.to(energyRing, {
        borderWidth: "1px",
        opacity: 0,
        duration: 0.7,
        ease: "power2.out"
      }, "-=0.85");
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col justify-center items-center overflow-hidden h-screen w-screen select-none transition-all duration-500 ${
        isDarkMode ? "text-stone-100" : "text-stone-900"
      } ${
        isLargeFont ? "text-lg font-black" : "text-sm font-medium"
      }`}
      style={{
        backgroundImage: `url(${rangerBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Immersive Dark/Light Backdrop Overlay with dynamic blurring supporting both themes */}
      <div className={`absolute inset-0 transition-all duration-500 pointer-events-none -z-10 ${
        isDarkMode 
          ? "bg-gradient-to-b from-[#030b08]/80 via-[#05170f]/85 to-[#010604]/82 backdrop-blur-[4px]" 
          : "bg-gradient-to-b from-[#fdfbf6]/65 via-[#f5efe2]/75 to-[#ebe5d4]/70 backdrop-blur-[3px]"
      }`} />

      {/* Immersive Dark/Light Oriental Background with faint glow nodes */}
      <div className="absolute inset-0 pointer-events-none transition-all duration-500">
        {/* Glow node */}
        <div className={`absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none ${
          isDarkMode ? "bg-emerald-800/15" : "bg-emerald-700/5"
        }`} />
        <div className={`absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none ${
          isDarkMode ? "bg-amber-600/10" : "bg-amber-600/5"
        }`} />
      </div>

      {/* Exquisite GSAP Energy Portal Transition Overlay element */}
      <div 
        ref={portalOverlayRef}
        className="pointer-events-none absolute w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-900 to-amber-500 opacity-0 flex items-center justify-center z-50 transform scale-0"
        style={{
          boxShadow: "0 0 120px 40px rgba(16, 185, 129, 0.45)",
          transformOrigin: "center center"
        }}
      >
        <div className="energy-ring absolute inset-0 rounded-full border-[10px] border-amber-400 opacity-90" />
      </div>

      {/* Main Content Card container */}
      <div ref={mainContentRef} className="relative z-10 w-full max-w-md px-6 py-4 flex flex-col items-center justify-center text-center max-h-[95vh] overflow-y-auto scrollbar-none">
        
        <AnimatePresence mode="wait">
          
          {/* Step 1: Welcome & Wish Entry */}
          {step === "greeting" && (
            <motion.div
              key="greeting-pane"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center w-full"
            >
              {/* Exquisite Vector Taiji graphic with gold gradient details */}
              <div className="relative mb-6 flex justify-center items-center">
                {/* Glow ring */}
                <div className={`absolute inset-0 w-24 h-24 -m-2 rounded-full blur-[10px] animate-pulse pointer-events-none ${
                  isDarkMode ? "bg-amber-500/10" : "bg-amber-700/5"
                }`} />
                
                <svg viewBox="0 0 100 100" className="w-24 h-24 filter drop-shadow-[0_4px_18px_rgba(217,166,25,0.25)] animate-[spin_20s_linear_infinite]" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer delicate dashed gold ring */}
                  <circle cx="50" cy="50" r="48" fill="none" stroke="url(#goldGradient)" strokeWidth="0.85" strokeDasharray="3 3" className="opacity-80" />
                  
                  {/* Concentric inner gold circle */}
                  <circle cx="50" cy="50" r="44" fill="none" stroke="url(#goldGradient)" strokeWidth="1.25" />

                  {/* Main Taiji Circle Base (Dark Side - Deep Obsidian Green) */}
                  <circle cx="50" cy="50" r="41" fill="#03160e" />

                  {/* Yin/Yang division (Light side - Jade White) */}
                  <path d="M 50 9 A 20.5 20.5 0 0 0 50 50 A 20.5 20.5 0 0 1 50 91 A 41 41 0 0 0 50 9 Z" fill="#FDFBF9" stroke="url(#goldGradient)" strokeWidth="0.75" />
                  
                  {/* Fine Gold Divider line for exquisite traditional feel */}
                  <path d="M 50 9 A 20.5 20.5 0 0 0 50 50 A 20.5 20.5 0 0 1 50 91" fill="none" stroke="url(#goldGradient)" strokeWidth="1.2" />

                  {/* Eye on Light Side (Obsidian Dark with Gold Ring) */}
                  <circle cx="50" cy="29.5" r="5" fill="#03160e" stroke="url(#goldGradient)" strokeWidth="0.75" />

                  {/* Eye on Dark Side (Jade White with Gold Ring) */}
                  <circle cx="50" cy="70.5" r="5" fill="#FDFBF9" stroke="url(#goldGradient)" strokeWidth="0.75" />

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffeeaa" />
                      <stop offset="50%" stopColor="#d9a619" />
                      <stop offset="100%" stopColor="#9a7008" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <h1 className={`font-black tracking-wider mb-2 font-serif ${
                isDarkMode 
                  ? "text-transparent bg-clip-text bg-gradient-to-b from-emerald-100 via-emerald-200 to-amber-200" 
                  : "text-emerald-950"
              } ${
                isLargeFont ? "text-3xl" : "text-2xl"
              }`}>
                灵枢阁 • 摇签问茶
              </h1>
              
              {/* Elegant Classic Blockquote Element for Contrast, Readability & Tradition */}
              <blockquote className={`relative max-w-sm border-l-4 rounded-r-xl text-left shadow-sm p-5.5 my-6 backdrop-blur-md transition-all duration-300 ${
                isDarkMode 
                  ? "border-[#c0382d] bg-[#04120ca2]/60 text-stone-200 border-y border-r border-white/5" 
                  : "border-[#911f16] bg-amber-50/50 text-[#03160e] border-y border-r border-[#911f16]/10 shadow-sm"
              } ${
                isLargeFont ? "text-lg md:text-xl leading-relaxed font-bold" : "text-sm md:text-base leading-relaxed font-bold"
              }`}>
                <span className={`absolute -top-3.5 -left-1 text-3xl font-serif ${
                  isDarkMode ? "text-[#c0382d]/40" : "text-[#911f16]/30"
                }`}>“</span>
                <p className="font-semibold tracking-wide font-serif">
                  凡五脏流转，皆有气应。入阁问病之前，请施主平心静气。可默默于心中祈愿，随灵签求问大医五腑颐养之法。
                </p>
                <cite className={`block text-right mt-2 text-xs md:text-sm font-serif font-black ${
                  isDarkMode ? "text-[#e25345]" : "text-[#911f16]"
                }`}>
                  ——《黄帝内经 • 灵枢》
                </cite>
                <span className={`absolute -bottom-5 right-2 h-4 text-3xl font-serif ${
                  isDarkMode ? "text-[#c0382d]/40" : "text-[#911f16]/30"
                }`}>”</span>
              </blockquote>

              {/* Progress Bar showing underlying resources loading or stabilization */}
              <div className={`w-full border rounded-full h-2 overflow-hidden mb-6 relative transition-all duration-350 ${
                isDarkMode ? "bg-stone-900/80 border-white/[0.04]" : "bg-red-800/5 border-[#911f16]/10"
              }`}>
                <div 
                  className={`h-full transition-all duration-300 ${
                    isDarkMode 
                      ? "bg-[#c0382d]" 
                      : "bg-[#911f16]"
                  }`}
                  style={{ width: `${ambientProgress}%` }}
                />
              </div>

              <p className={`text-[11px] font-black tracking-widest mb-6 animate-pulse flex items-center gap-1.5 justify-center ${
                isDarkMode ? "text-[#e25345]" : "text-[#911f16]"
              }`}>
                <Activity className="w-3.5 h-3.5 animate-spin" />
                御医阁内温药预调中 • 正气蓄能 {ambientProgress}%
              </p>

              {/* Draw Button */}
              <button
                onClick={triggerShake}
                disabled={ambientProgress < 15} // Avoid blocking user but encourage contemplation
                className={`group relative overflow-hidden text-center flex items-center justify-center gap-2 font-black transition-all cursor-pointer hover:scale-105 active:scale-95 active:translate-y-0.5 bg-gradient-to-r from-[#911f16] to-[#a6251b] hover:from-[#a6251b] hover:to-[#bd2d22] text-white border-b-4 border-rose-950 shadow-lg shadow-rose-950/15 ${
                  isLargeFont ? "py-5 px-10 rounded-2xl text-lg w-full" : "py-3.5 px-8 rounded-xl text-xs"
                }`}
              >
                <span>静心凝神 • 手摇灵签</span>
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/30 opacity-40 group-hover:animate-[shine_1.2s_ease-out_infinite]" />
              </button>

            </motion.div>
          )}

          {/* Step 2: Shaking animation */}
          {step === "shaking" && (
            <motion.div
              key="shaking-pane"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center"
            >
              {/* Premium Physical Cylinder Graphics with custom wood textures and borders */}
              <div 
                ref={cylinderRef}
                className="relative mb-10 w-28 h-48 flex items-center justify-center origin-bottom"
              >
                {/* Cylinder Container with premium dark lacquered wood gradient and borders */}
                <div className="w-24 h-44 bg-gradient-to-b from-[#3a0604] via-[#1f0201] to-[#120101] border-4 border-amber-600/65 rounded-t-lg rounded-b-3xl relative shadow-[0_22px_55px_rgba(0,0,0,0.7)] flex flex-col justify-start pt-4 items-center">
                  
                  {/* Luxury Brass band with wordless geometric patterns */}
                  <div className="absolute top-8 w-full h-5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 border-y border-amber-500/40 flex items-center justify-center gap-1.5 pointer-events-none">
                    <span className="w-1 h-1 bg-amber-950 rounded-full opacity-60" />
                    <span className="w-1 h-1 bg-amber-950 rounded-full opacity-60" />
                    <span className="w-1.5 h-1.5 bg-amber-950 rotate-45" />
                    <span className="w-1 h-1 bg-amber-950 rounded-full opacity-60" />
                    <span className="w-1 h-1 bg-amber-950 rounded-full opacity-60" />
                  </div>

                  <div className="absolute bottom-10 w-full h-1 bg-amber-500/20" />
                  
                  {/* Exquisite Sticks with wood color variations and traditional crimson painted tips (NO text characters) */}
                  <div ref={sticksRef} className="absolute -top-14 flex gap-1 items-end justify-center h-16 w-16 select-none pointer-events-none">
                    <div className="w-2 h-16 bg-gradient-to-b from-amber-100 to-amber-700 rounded-sm border border-amber-900/40 transform -rotate-15 origin-bottom shadow-md flex flex-col items-center justify-start overflow-hidden">
                      <div className="w-full h-3 bg-[#911f16]" />
                      <div className="w-[1px] h-full bg-amber-950/20 mt-1" />
                    </div>
                    <div className="w-2 h-14 bg-gradient-to-b from-amber-50 to-amber-600 rounded-sm border border-amber-900/40 transform -rotate-6 origin-bottom shadow-md flex flex-col items-center justify-start overflow-hidden">
                      <div className="w-full h-2.5 bg-[#911f16]" />
                      <div className="w-[1px] h-full bg-amber-950/20 mt-1" />
                    </div>
                    <div className="w-2.5 h-18 bg-gradient-to-b from-amber-200 to-amber-800 rounded-sm border-2 border-amber-500 transform rotate-3 origin-bottom shadow-lg flex flex-col items-center justify-start overflow-hidden animate-pulse">
                      <div className="w-full h-4 bg-[#911f16]" />
                      <div className="w-[1.5px] h-full bg-amber-950/30 mt-1" />
                    </div>
                    <div className="w-2 h-15 bg-gradient-to-b from-amber-100 to-amber-700 rounded-sm border border-amber-900/40 transform rotate-[12deg] origin-bottom shadow-md flex flex-col items-center justify-start overflow-hidden">
                      <div className="w-full h-3 bg-[#911f16]" />
                      <div className="w-[1px] h-full bg-amber-950/20 mt-1" />
                    </div>
                    <div className="w-2 h-16 bg-gradient-to-b from-amber-100 to-amber-700 rounded-sm border border-amber-900/40 transform rotate-[22deg] origin-bottom shadow-md flex flex-col items-center justify-start overflow-hidden">
                      <div className="w-full h-3 bg-[#911f16]" />
                      <div className="w-[1px] h-full bg-amber-950/20 mt-1" />
                    </div>
                  </div>

                  {/* Circular Sacred Geometric Emblem instead of Chinese characters */}
                  <div className="mt-14 w-11 h-11 border-2 border-amber-500/60 rounded-full flex items-center justify-center bg-gradient-to-b from-amber-500/10 to-amber-950/20 shadow-inner relative">
                    <div className="w-8 h-8 border border-dashed border-amber-400/40 rounded-full animate-[spin_40s_linear_infinite]" />
                    <div className="absolute w-5 h-5 border border-amber-500/50 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-amber-500/80 rounded-full" />
                    </div>
                  </div>

                  {/* Base Brass Plate */}
                  <div className="absolute bottom-0 w-full h-3 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 rounded-b-2xl border-t border-amber-750" />
                </div>

                {/* Ring wave sparkles around shaking tube */}
                <span className="absolute -left-10 top-[25%] w-8 h-2 bg-red-500/30 rounded-full blur-[3px] animate-ping" />
                <span className="absolute -right-10 top-[35%] w-8 h-2 bg-red-500/30 rounded-full blur-[3px] animate-[ping_1.2s_infinite]" />
              </div>

              {/* Shaking Sound ripple indicators tuned to the unified red palette */}
              <div className="flex items-center gap-2 justify-center mt-3 h-8">
                <span className="w-2 h-5 bg-[#c0382d]/80 rounded-full animate-[pulse_0.3s_infinite_alternate]" />
                <span className="w-2 h-7 bg-[#911f16] rounded-full animate-[pulse_0.2s_infinite_alternate_0.1s]" />
                <span className="w-2 h-4 bg-[#c0382d]/70 rounded-full animate-[pulse_0.4s_infinite_alternate_0.05s]" />
              </div>

              <p className={`font-black mt-5 animate-pulse tracking-widest ${
                isLargeFont ? "text-xl" : "text-sm"
              } ${
                isDarkMode ? "text-emerald-400" : "text-emerald-800"
              }`}>
                🍁 哗啦哗啦 • 宿命神辨中...
              </p>
              
              <p className={`text-[11px] font-bold mt-2 ${
                isDarkMode ? "text-stone-400" : "text-stone-700"
              }`}>
                心不随物转，意在气血间。大医正在为您摇问真药。
              </p>
            </motion.div>
          )}

          {/* Step 3: Slip Revealed! */}
          {step === "revealed" && (
            <motion.div
              key="revealed-pane"
              initial={{ opacity: 0, scale: 0.7, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ type: "spring", stiffness: 90, damping: 14 }}
              className="flex flex-col items-center w-full"
            >
              {/* Confetti Explosion Effects */}
              <div className="absolute pointer-events-none inset-0 flex items-center justify-center transform scale-150">
                {particles.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.2 }}
                    transition={{ duration: 1.8, ease: "easeOut" }}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: p.size,
                      height: p.size,
                      backgroundColor: p.color,
                      boxShadow: `0 0 12px ${p.color}`,
                    }}
                  />
                ))}
              </div>

              {/* Glowing Halo behind Slip */}
              <div className="absolute w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none -z-10" />



              {/* Traditional Paper Slip Card Graphic */}
              <div className="relative w-full bg-[#fdfbf7] border-[7px] border-[#911f16] rounded-2xl shadow-xl shadow-emerald-950/15 p-6 text-stone-900 overflow-hidden select-text font-serif">
                
                {/* Slip Grid Design Element */}
                <div className="absolute inset-1.5 border-2 border-[#911f16]/10 pointer-events-none" />
                <div className="absolute top-0 right-2 text-[5.5rem] text-[#911f16]/[0.02] font-black pointer-events-none font-serif leading-none">
                  医
                </div>

                {/* Wish header if user wrote one */}
                {wish && (
                  <div className="border-b border-dashed border-[#911f16]/20 pb-2 mb-3.5 text-center">
                    <span className="text-[11px] text-[#911f16] bg-[#911f16]/5 rounded-md px-2.5 py-1 font-bold">
                      🌸 封存祈愿 : {wish}
                    </span>
                  </div>
                )}

                {/* Grade Label */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-1 text-[10.5px] text-stone-500 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>今日良辰：颐养泰来</span>
                  </div>
                  <div className="bg-[#911f16] text-amber-100 font-black px-3.5 py-1 rounded-[6px] text-sm leading-none flex items-center gap-1 shadow-md">
                    <span>{selectedSlip.grade}</span>
                  </div>
                </div>

                {/* Bold Oriental Slip Title */}
                <h2 className="text-[#911f16] font-black tracking-wider text-xl md:text-2xl font-serif text-center mb-4 leading-tight">
                  {selectedSlip.title}
                </h2>

                {/* Classic Poetic Verse */}
                <div className="bg-[#FAF4E5] border border-[#e8dcb9] p-4.5 rounded-xl mb-4.5 text-center shadow-inner">
                  <p className="text-stone-800 font-black tracking-widest leading-relaxed text-sm md:text-base font-serif italic text-rose-950 whitespace-pre-wrap">
                    「{selectedSlip.poem}」
                  </p>
                </div>

                {/* Detailed Prescription Advice */}
                <div className="text-left space-y-3.5 mb-4.5">
                  <div>
                    <h4 className="text-white bg-[#911f16] inline-block text-[10px] font-black px-2 py-0.5 rounded-sm tracking-widest mb-1 shadow-xs">
                      【签鉴诊断】
                    </h4>
                    <p className="text-[12px] leading-relaxed font-bold text-stone-700">
                      {selectedSlip.meaning}
                    </p>
                  </div>

                  {/* Root Affinity box */}
                  <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-start gap-3 shadow-3xs">
                    <span className="text-2xl shrink-0">🌿</span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-black text-emerald-800">【本草守护神】</span>
                        <span className="text-xs font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{selectedSlip.herb}</span>
                      </div>
                      <p className="text-[10px] text-stone-600 font-semibold mt-1 leading-relaxed">
                        {selectedSlip.herbDetail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Time Indicator & Direction */}
                <div className="border-t border-dashed border-[#911f16]/15 pt-3.5 flex justify-between items-center text-[10px] text-stone-500 font-bold flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#911f16]" />
                    <span className="font-bold text-[#911f16]">{selectedSlip.direction}</span>
                  </div>
                  <div className="text-[#911f16]/60 font-black">大医阁主尊留</div>
                </div>

              </div>

              {/* Action: Receive Blessing and Enter Pavilion */}
              <button
                type="button"
                onClick={handleEnterCabinet}
                className={`group relative overflow-hidden bg-gradient-to-r from-[#911f16] to-[#a6251b] hover:from-[#a6251b] hover:to-[#bd2d22] text-white font-black shadow-xl shadow-rose-950/20 cursor-pointer border-b-4 border-rose-950 active:border-b-0 active:translate-y-1 hover:scale-105 transition-all text-center flex items-center justify-center gap-2 mt-6 ${
                  isLargeFont ? "py-5 px-10 rounded-2xl text-lg w-full" : "py-3.5 px-8 rounded-xl text-xs"
                }`}
              >
                <span>领受妙意 • 进入五觉阁</span>
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-35 group-hover:animate-[shine_1.2s_ease-out_infinite]" />
              </button>

            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* Dynamic inline styles for customized shines */}
      <style>{`
        @keyframes shine {
          100% {
            left: 125%;
          }
        }
      `}</style>
    </div>
  );
}
