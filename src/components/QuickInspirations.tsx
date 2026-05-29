import React from "react";
import { Sparkles, Soup, Heart, Footprints, Flower2, Gift, Lightbulb } from "lucide-react";
import { ModuleType } from "../types";

interface QuickInspirationsProps {
  activeModule: ModuleType;
  onSelectInspiration: (text: string) => void;
  isLargeFont?: boolean;
  isDarkMode?: boolean;
}

export default function QuickInspirations({ activeModule, onSelectInspiration, isLargeFont, isDarkMode }: QuickInspirationsProps) {
  // Configured suggestions tailored based on activeModule
  const inspirationMappers: Record<ModuleType, { title: string; icon: any; color: string; list: { text: string; label: string }[] }> = {
    diet: {
      title: "应季食疗",
      icon: Soup,
      color: "border-amber-500/20 text-amber-700 bg-amber-500/10",
      list: [
        { text: "立夏梅雨节气，吃什么食材最能祛湿养心、调和脾胃？", label: "祛湿养心" },
        { text: "推荐一款适合办公室白领，下午三点办公泡饮的“参芪亮睛茶”配方。", label: "白领药茶" },
        { text: "我脾胃虚弱、容易胃胀，怎么利用日常山药与生姜进行温补膳食？", label: "温健脾胃" },
        { text: "晚饭总是吃太多积食难消，有没有消食化积的中医小汤方推荐？", label: "消食解积" }
      ]
    },
    exercise: {
      title: "气血导引",
      icon: Footprints,
      color: "border-blue-500/20 text-blue-700 bg-blue-500/10",
      list: [
        { text: "久坐一整天不仅肩膀僵硬，颈椎也酸痛。有推荐哪个十秒钟即效的拉穴小动作？", label: "肩颈放松" },
        { text: "常听八段锦有调和脏腑大功用。我脾胃不好，该专练里面的哪一式？动作要诀是什么？", label: "调脾胃神功" },
        { text: "眼睛看久了电脑干涩流泪，怎么按压眼周经络、摩擦生热来进行熨眼调理？", label: "明目熨眼" },
        { text: "一到下午四五点就腰酸背痛，中医里的“撞背八打”或导引放松该如何安全进行？", label: "活经舒腰" }
      ]
    },
    mental: {
      title: "安心情志",
      icon: Heart,
      color: "border-pink-500/20 text-pink-700 bg-pink-500/10",
      list: [
        { text: "工作压力太大、情绪偶尔陷入低谷无法集中，有适合现在的三分钟深呼吸吐气调息诀吗？", label: "三分钟静心" },
        { text: "晚上虚烦、辗转反侧总是入睡不了。推荐一剂可以使人宁神静气的温汤泡脚中药配方。", label: "安神足浴" },
        { text: "焦虑烦躁时总觉得胸闷。据说按揉手腕或手掌上的安神秘密穴位立竿见影，定位是什么？", label: "舒胸平绪" },
        { text: "容易悲忧叹气、总觉得胸中有一股“气结”，中医如何通过药膳冲茶帮助疏肝解郁？", label: "疏肝悦志" }
      ]
    },
    wellness: {
      title: "时辰穴位",
      icon: Flower2,
      color: "border-emerald-500/20 text-emerald-700 bg-emerald-500/10",
      list: [
        { text: "十二时辰按节气轮流当令。当前这个时辰，身体哪条经络最兴盛？应该怎么顺时调养？", label: "十二时辰" },
        { text: "手脚一降温就冰凉怕冷，听说艾灸或按揉“足三里”、“涌泉”很管用，具体如何按抚？", label: "回阳暖肢" },
        { text: "上班久坐不运动。怎么点揉我们脚踝内侧的“太溪穴”或“三阴交”，以固本培元、补养气血？", label: "固元双穴" },
        { text: "进入闷热或转季，身体常有湿气重、头重脚轻之感，有哪些经穴拍打或排湿方法？", label: "排湿排痹" }
      ]
    },
    surprise: {
      title: "随缘妙用",
      icon: Gift,
      color: "border-purple-500/20 text-purple-700 bg-purple-500/10",
      list: [
        { text: "给我摇一个适合我今天的“东方随缘养生今日签”。宜什么、忌什么、有什么温和妙法？", label: "养生随缘签" },
        { text: "大医，用白话讲讲古代神医（比如李时珍或孙思邈）发生的有趣日常养生小故事吧！", label: "神医奇事" },
        { text: "编一首古风活波好记的“常回家晒背口诀”或日常暖身歌谣，让我读后舒畅大笑。", label: "打油暖身诀" },
        { text: "给我一个适合现代懒人的“养生超级冷知识”，能轻松运用在每天生活的细节里。", label: "极简冷知识" }
      ]
    }
  };

  const currentMapper = inspirationMappers[activeModule];
  const IconComponent = currentMapper.icon;

  return (
    <div className="w-full max-w-5xl mx-auto px-1 mt-1">
      {/* Dynamic Tagline */}
      <div className="flex items-center gap-1.5 mb-2.5 px-1 flex-wrap">
        <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
        <span className={`${isLargeFont ? "text-sm font-black" : "text-xs font-black"} ${
          isDarkMode ? "text-emerald-350" : "text-emerald-950"
        }`}>
          「{currentMapper.title}」今日调理探讨：
        </span>
      </div>

      {/* Suggested horizontal grid buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {currentMapper.list.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectInspiration(item.text)}
            className={`text-left transition-all duration-200 group flex flex-col justify-between cursor-pointer outline-none focus:outline-none focus:ring-1 shadow-3xs border ${
              isDarkMode 
                ? "bg-black/45 hover:bg-[#0a2316e1]/95 border-emerald-950/65 hover:border-emerald-700 text-stone-100 focus:ring-emerald-800" 
                : "bg-white/80 hover:bg-[#eef7f2] border-stone-200/50 hover:border-emerald-300 text-stone-800 focus:ring-emerald-200"
            } ${
              isLargeFont ? "p-4 min-h-[110px] rounded-[24px]" : "p-3 min-h-[82px] rounded-2xl"
            }`}
          >
            {/* Tag Badge */}
            <div className="flex items-center gap-1 mb-1.5">
              <span className={`font-black px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 border ${
                isDarkMode 
                  ? "bg-emerald-950/70 text-emerald-300 border-emerald-900/40" 
                  : "bg-emerald-50 text-emerald-800 border-emerald-100"
              } ${
                isLargeFont ? "text-[11px]" : "text-[9px]"
              }`}>
                <Lightbulb className={`text-emerald-500 ${isLargeFont ? "w-3 h-3" : "w-2.5 h-2.5"}`} />
                {item.label}
              </span>
            </div>

            {/* Prompt text preview */}
            <p className={`font-extrabold leading-relaxed transition-colors line-clamp-2 ${
              isDarkMode 
                ? "text-stone-300 group-hover:text-amber-100" 
                : "text-stone-700 group-hover:text-emerald-950"
            } ${
              isLargeFont ? "text-[13px]" : "text-[11px]"
            }`}>
              {item.text}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
