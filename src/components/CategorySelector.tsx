import React from "react";
import { Utensils, Footprints, Heart, Flower2, Gift } from "lucide-react";
import { ModuleType } from "../types";

interface CategorySelectorProps {
  activeModule: ModuleType | null;
  onSelectModule: (module: ModuleType) => void;
  isLargeFont?: boolean;
  isDarkMode?: boolean;
}

export default function CategorySelector({ activeModule, onSelectModule, isLargeFont, isDarkMode }: CategorySelectorProps) {
  const categories = [
    {
      id: "diet" as ModuleType,
      title: "饮食",
      desc: "健康食疗 · 膳方养人",
      icon: Utensils,
      bg: "bg-amber-50/50 hover:bg-amber-50",
      activeBorder: "border-amber-400 ring-2 ring-amber-400/20",
      activeText: "text-amber-700",
      iconColor: "text-amber-600",
      dotColor: "bg-amber-400",
      emoji: "🍱"
    },
    {
      id: "exercise" as ModuleType,
      title: "运动",
      desc: "导引术 · 活络气血",
      icon: Footprints,
      bg: "bg-blue-50/50 hover:bg-blue-50",
      activeBorder: "border-blue-400 ring-2 ring-blue-400/20",
      activeText: "text-blue-700",
      iconColor: "text-blue-600",
      dotColor: "bg-blue-400",
      emoji: "🏃"
    },
    {
      id: "mental" as ModuleType,
      title: "心理",
      desc: "安心宁神 · 情志平衡",
      icon: Heart,
      bg: "bg-pink-50/50 hover:bg-pink-50",
      activeBorder: "border-pink-400 ring-2 ring-pink-400/20",
      activeText: "text-pink-700",
      iconColor: "text-pink-600",
      dotColor: "bg-pink-400",
      emoji: "🧠"
    },
    {
      id: "wellness" as ModuleType,
      title: "养生",
      desc: "经络节气 · 天人合一",
      icon: Flower2,
      bg: "bg-emerald-50/50 hover:bg-emerald-50",
      activeBorder: "border-emerald-500 ring-3 ring-emerald-500/20",
      activeText: "text-emerald-800",
      iconColor: "text-emerald-700",
      dotColor: "bg-emerald-500",
      emoji: "🍃"
    },
    {
      id: "surprise" as ModuleType,
      title: "惊喜",
      desc: "随机彩蛋 · 灵机妙用",
      icon: Gift,
      bg: "bg-purple-50/50 hover:bg-purple-50",
      activeBorder: "border-purple-400 ring-2 ring-purple-400/20",
      activeText: "text-purple-700",
      iconColor: "text-purple-600",
      dotColor: "bg-purple-400",
      emoji: "🎁"
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-5 gap-3.5 w-full mx-auto px-1`}>
      {categories.map((cat) => {
        const isActive = activeModule === cat.id;
        const IconComponent = cat.icon;

        // Custom dynamic layout parameters according to Day/Night settings
        let cardBg = "";
        let borderClass = "";
        let textClass = "";
        let labelClass = "";
        let iconBgClass = "";
        let iconColorClass = "";

        if (isDarkMode) {
          iconBgClass = isActive ? "bg-emerald-950/40 border border-emerald-800/10" : "bg-white/5 shadow-inner";
          iconColorClass = isActive ? cat.iconColor : "text-stone-300";
          labelClass = "text-stone-400";

          if (cat.id === "diet") {
            cardBg = isActive ? "bg-amber-950/30 backdrop-blur-xl text-amber-100" : "bg-white/[0.03] hover:bg-amber-950/10 backdrop-blur-md text-stone-300";
            borderClass = isActive ? "border-amber-400/50 ring-1 ring-amber-400/20" : "border-white/5 hover:border-amber-400/20";
            textClass = isActive ? "text-amber-300" : "text-stone-300";
          } else if (cat.id === "exercise") {
            cardBg = isActive ? "bg-blue-950/30 backdrop-blur-xl text-blue-100" : "bg-white/[0.03] hover:bg-blue-950/10 backdrop-blur-md text-stone-300";
            borderClass = isActive ? "border-blue-400/50 ring-1 ring-blue-400/20" : "border-white/5 hover:border-blue-400/20";
            textClass = isActive ? "text-blue-300" : "text-stone-300";
          } else if (cat.id === "mental") {
            cardBg = isActive ? "bg-pink-950/30 backdrop-blur-xl text-pink-100" : "bg-white/[0.03] hover:bg-pink-950/10 backdrop-blur-md text-stone-300";
            borderClass = isActive ? "border-pink-400/50 ring-1 ring-pink-400/20" : "border-white/5 hover:border-pink-400/20";
            textClass = isActive ? "text-pink-300" : "text-stone-300";
          } else if (cat.id === "wellness") {
            cardBg = isActive ? "bg-emerald-950/30 backdrop-blur-xl text-emerald-100" : "bg-white/[0.03] hover:bg-emerald-950/10 backdrop-blur-md text-stone-300";
            borderClass = isActive ? "border-emerald-400/50 ring-1 ring-emerald-400/20" : "border-white/5 hover:border-emerald-400/20";
            textClass = isActive ? "text-emerald-300" : "text-stone-300";
          } else if (cat.id === "surprise") {
            cardBg = isActive ? "bg-purple-950/30 backdrop-blur-xl text-purple-100" : "bg-white/[0.03] hover:bg-purple-950/10 backdrop-blur-md text-stone-300";
            borderClass = isActive ? "border-purple-400/50 ring-1 ring-purple-400/20" : "border-white/5 hover:border-purple-400/20";
            textClass = isActive ? "text-purple-300" : "text-stone-300";
          }
        } else {
          // Standard Day (Light mode) bindings with soft glassmorphic transparency
          iconBgClass = isActive ? "bg-emerald-150/20" : "bg-white/25 shadow-3xs";
          iconColorClass = isActive ? cat.iconColor : "text-stone-500";
          labelClass = "text-stone-500";
          cardBg = isActive 
            ? "bg-white/60 backdrop-blur-lg scale-[1.03] shadow-sm font-black" 
            : "bg-white/20 backdrop-blur-md hover:-translate-y-0.5 text-stone-700 hover:shadow-2xs hover:bg-white/35";
          borderClass = isActive ? "border-emerald-400/40 ring-1 ring-emerald-400/10" : "border-white/20 hover:border-emerald-200/40";
          textClass = isActive ? "text-stone-950 font-extrabold" : "text-stone-850";
        }

        return (
          <button
            key={cat.id}
            id={`cat-card-${cat.id}`}
            onClick={() => onSelectModule(cat.id)}
            className={`relative flex flex-col items-center justify-between rounded-[28px] border transition-all duration-350 shadow-3xs group cursor-pointer text-center outline-none focus:outline-none focus:ring-0 ${
              isLargeFont ? "p-4.5 min-h-[135px]" : "p-3.5 min-h-[110px]"
            } ${cardBg} ${borderClass}`}
          >
            {/* Top Badge Emoji */}
            <div className={`absolute top-2 right-2.5 opacity-80 group-hover:scale-125 transition-transform ${
              isLargeFont ? "text-base" : "text-[11px]"
            }`}>
              {cat.emoji}
            </div>

            {/* Central Icon container */}
            <div className={`rounded-xl transition-all duration-300 flex items-center justify-center ${
              isLargeFont ? "p-3.5 mb-1.5" : "p-2.5 mb-2.5"
            } ${iconBgClass}`}>
              <IconComponent className={`transition-transform group-hover:scale-105 ${
                isLargeFont ? "w-8 h-8 stroke-[2.4]" : "w-5.5 h-5.5 stroke-[2.2]"
              } ${iconColorClass}`} />
            </div>

            {/* Typography items */}
            <div className="flex flex-col items-center">
              <span className={`tracking-wide transition-colors ${
                isLargeFont 
                  ? "text-[15px] font-black" 
                  : isActive 
                    ? "text-[12.5px] font-extrabold" 
                    : "text-xs font-bold"
              } ${textClass}`}>
                {cat.id === "diet" ? "健康饮食" : cat.title}
              </span>
              {!isLargeFont && (
                <span className={`text-[9px] font-semibold leading-none mt-1 ${labelClass}`}>
                  {cat.desc.split(" · ")[0]}
                </span>
              )}
            </div>

            {/* Active pulse bottom block indicator */}
            {isActive && (
              <span className={`absolute bottom-2.5 w-6 h-0.5 rounded-full ${cat.dotColor} animate-pulse`} />
            )}
          </button>
        );
      })}
    </div>
  );
}
