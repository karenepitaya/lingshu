import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message, ModuleType, Attachment } from "../types";
import { 
  Send, User, Bot, Volume2, VolumeX, Mic, MicOff, 
  Sparkles, Paperclip, Image as ImageIcon, X, HelpCircle, FileText
} from "lucide-react";

interface VoiceConsultantProps {
  externalPrompt: string; // Lifted state to trigger when clock prompts are clicked
  clearExternalPrompt: () => void;
  activeModule: ModuleType;
  isLargeFont: boolean;
  isDarkMode?: boolean;
  onStreamingChange?: (streaming: boolean) => void;
}

const moduleNames: Record<ModuleType, { label: string; icon: string; welcome: string; welcomeAccessible: string; placeholder: string; placeholderLarge: string }> = {
  diet: {
    label: "应季饮食",
    icon: "🍱",
    welcome: "您好！我是您的应季膳食顾问。请说说您最近的饮食情况：比如是否有脾胃虚弱、容易胀气、反酸，或是口干口渴？当前正值节气交替，我会为您推荐合适的膳食方和茶饮。支持拖拽或直接发送食物、舌苔照片来辅助分析哦。",
    welcomeAccessible: "您好，我来帮您调理饮食。平时胃口怎么样，有没有积食反酸或者大便不调？写字或长按底下红色话筒跟我说说，我给您推荐暖胃的茶饮膳方。发个食物或舌苔照片也行。",
    placeholder: "说说您的脾胃状况、饮食偏好或养生需求…",
    placeholderLarge: "写下您的脾胃状况或饮食偏好，放心写…"
  },
  exercise: {
    label: "导引运动",
    icon: "🏃",
    welcome: "您好！我是您的运动导引顾问。久坐容易导致肩颈僵硬、气血不畅。您最近是否有颈椎不适、手臂发凉，还是肩膀活动受限？我可以带您练习八段锦中的针对性招式，或做几组简单的拉伸放松。发送疼痛部位照片也能帮您分析哦。",
    welcomeAccessible: "您好！久坐对筋骨损耗很大。您有腰腿酸紧、肩膀发沉吗？跟我说说哪里不舒服，我教您一两招八段锦或者拉伸动作，舒展筋络，很管用。",
    placeholder: "告诉我哪里酸痛僵硬，或想学什么功法…",
    placeholderLarge: "写下您哪里酸痛不舒服，放心写…"
  },
  mental: {
    label: "宁神心理",
    icon: "🧠",
    welcome: "您好！我是您的情志调理顾问。压力和焦虑常常影响身心状态。您是否感觉容易疲倦、夜间难以入睡，或是胸闷喜欢叹气？您可以在这里倾诉，我会为您推荐安神茶饮或三分钟呼吸调息法，帮您舒缓放松。",
    welcomeAccessible: "您好！心情舒畅，身体自然轻松。最近睡眠怎么样，白天是不是有心事？跟我说说困扰您的地方，我帮您疏导一下，做做呼吸练习，人就舒服了。",
    placeholder: "聊聊您的情绪、压力或睡眠状况…",
    placeholderLarge: "写下您的心情烦恼或睡眠问题，放心写…"
  },
  wellness: {
    label: "时穴养生",
    icon: "🍃",
    welcome: "您好！我是您的经穴养生顾问。顺应时辰调理，有助于改善身体状态。请告诉我您的不适，比如胃痛、头痛、手脚冰凉或容易疲劳，我会为您推荐当前时段适合按揉的穴位和手法，帮助恢复元气。",
    welcomeAccessible: "您好！按按穴位，气血就通了。您现在哪里不舒服，手脚容易发凉吗？我来告诉您按揉哪个穴位管用，手法讲解详细，听得懂也学得快！",
    placeholder: "说说您哪里不适，或想了解什么穴位…",
    placeholderLarge: "写下您的不适症状或想了解的穴位…"
  },
  surprise: {
    label: "随缘彩蛋",
    icon: "🎁",
    welcome: "您好！我是您的健康彩蛋助理。这里准备了有趣的「养生随缘签」，还有古代名医的生活趣闻。您想了解今日养生宜忌，还是听听孙思邈、李时珍的有趣故事？",
    welcomeAccessible: "您好！今天给您准备了养生趣味签，还有李时珍种草药的小故事。您说句话，咱们来看看今天的养生运势！",
    placeholder: "",
    placeholderLarge: ""
  }
};

export default function VoiceConsultant({ 
  externalPrompt, 
  clearExternalPrompt, 
  activeModule,
  isLargeFont,
  isDarkMode,
  onStreamingChange
}: VoiceConsultantProps) {
  // Messages default initialized to empty to allow typewriter trigger on mounted choice
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false); // Default read off to keep layout serene
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [pasteNotification, setPasteNotification] = useState<string | null>(null);
  
  // Track currently typing message id to replace its static content with streaming text
  const [streamingId, setStreamingId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = "zh-CN";
      rec.interimResults = false;

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        if (resultText) {
          setInput((prev) => prev ? prev + resultText : resultText);
        }
      };

      rec.onerror = (err: any) => {
        console.error("Speech Recognition Error:", err);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  // Synchrononize module setting to populate initialized dialogue with streaming sequence
  const prevModuleRef = useRef<ModuleType | null>(null);
  useEffect(() => {
    if (activeModule) {
      const moduleConf = moduleNames[activeModule];
      const welcomeText = isLargeFont ? moduleConf.welcomeAccessible : moduleConf.welcome;
      
      const isSwitch = prevModuleRef.current !== null && prevModuleRef.current !== activeModule;
      const displayGreet = isSwitch ? `✨ 已切换至【${moduleConf.label}】模式。${welcomeText}` : welcomeText;

      const introMsg: Message = {
        id: "initial-" + activeModule + "-" + Date.now(),
        role: "assistant",
        text: displayGreet,
        timestamp: new Date()
      };
      
      // To satisfy user desire for clean transitional outputs, resetting the viewport on switch keeps focus perfect
      setMessages([introMsg]);
      setStreamingId(introMsg.id);
      onStreamingChange?.(true);
      
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      speakText(welcomeText);
    }
    prevModuleRef.current = activeModule;
  }, [activeModule]);

  // Listen for external prompts triggered by clicking clock or presets
  useEffect(() => {
    if (externalPrompt) {
      handleSend(externalPrompt);
      clearExternalPrompt();
    }
  }, [externalPrompt]);

  // Scroll to bottom whenever message queue updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Clean speech on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Soft Chinese synthesis readback
  const speakText = (text: string) => {
    if (!isTtsEnabled || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      
      const cleanedText = text
        .replace(/[*#`\-·\n✨🍱🏃🧠🍃🎁【】]/g, " ")
        .replace(/\s+/g, " ")
        .substring(0, 150); // Keep it brief

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.lang = "zh-CN";
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find(v => v.lang.includes("ZH") || v.lang.includes("zh-CN")) || voices[0];
      if (zhVoice) {
        utterance.voice = zhVoice;
      }

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("SpeechSynthesis error:", e);
    }
  };

  const toggleTts = () => {
    setIsTtsEnabled(!isTtsEnabled);
    if (!isTtsEnabled) {
      speakText("语音播报已开启，稍后将为您朗读回复。");
    } else if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const toggleRecording = () => {
    if (!recognition) {
      alert("抱歉，您的浏览器环境暂不支持原生语音识别接口，建议使用最新 Chrome 浏览器。");
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      recognition.start();
    }
  };

  // Convert File object to attachment base64 helper
  const processFile = (file: File) => {
    if (!file) return;
    
    // Size check (max 6MB to prevent token overflow)
    if (file.size > 6 * 1024 * 1024) {
      alert("上传文件过大，为了顺畅交互请控制在 6MB 以内哦。");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Str = (reader.result as string).split(",")[1];
      const newAttachment: Attachment = {
        name: file.name,
        mimeType: file.type,
        data: base64Str,
        url: URL.createObjectURL(file)
      };
      setAttachments((prev) => [...prev, newAttachment]);
    };
    reader.readAsDataURL(file);
  };

  // Manual file trigger
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(processFile);
    }
  };

  // Clipboard Paste Event Listener
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    let hasImage = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processFile(file);
          hasImage = true;
        }
      }
    }

    if (hasImage) {
      setPasteNotification("已自动读取剪贴板复制的图像附件");
      setTimeout(() => setPasteNotification(null), 3000);
    }
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => {
      const copy = [...prev];
      if (copy[idx].url) {
        URL.revokeObjectURL(copy[idx].url!);
      }
      copy.splice(idx, 1);
      return copy;
    });
  };

  // Submit chat dialogue
  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed && attachments.length === 0) return;

    // Bundle files if any
    const finalAttachments = [...attachments];

    const userMsg: Message = {
      id: "msg-" + Date.now(),
      role: "user",
      text: trimmed || "用户上传了图片，请帮忙分析。",
      timestamp: new Date(),
      attachments: finalAttachments
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachments([]); // Reset upload buffer
    setLoading(true);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      // Send message queue with current module focus to Express API back-end
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activeModule: activeModule,
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            text: m.text,
            attachments: m.attachments?.map(att => ({
              mimeType: att.mimeType,
              data: att.data
            }))
          }))
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "API request failed");
      }

      // Chatflow Interrupt → 返回选择项
      if (data.chatflow_choices) {
        const botMsg: Message = {
          id: "msg-" + (Date.now() + 1),
          role: "assistant",
          text: data.chatflow_text || "请选择：",
          timestamp: new Date(),
          choices: data.chatflow_choices,
          chatflowConversationId: data.chatflow_conversation_id,
        };
        setMessages((prev) => [...prev, botMsg]);
        setStreamingId(botMsg.id);
        onStreamingChange?.(true);
        speakText(data.chatflow_text);
        return;
      }

      const botMsg: Message = {
        id: "msg-" + (Date.now() + 1),
        role: "assistant",
        text: data.text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
      setStreamingId(botMsg.id);
      onStreamingChange?.(true);
      speakText(data.text);
    } catch (error: any) {
      console.error("Consultant backcheck failed:", error);
      const errorMsg: Message = {
        id: "msg-err-" + Date.now(),
        role: "assistant",
        text: "抱歉，处理您的请求时出现了网络波动。请稍后再试，或换个问题重新发送。感谢理解。",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setStreamingId(errorMsg.id);
      onStreamingChange?.(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  // Chatflow 选择按钮点击 → 带 conversation_id 续接
  const handleChoiceClick = (choice: string, conversationId: string) => {
    // 把选择项作为用户消息显示
    const userMsg: Message = {
      id: "msg-" + Date.now(),
      role: "user",
      text: choice,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // 带 conversation_id 发送续接请求
    (async () => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activeModule: activeModule,
            messages: [{ role: "user", text: choice }],
            chatflow_conversation_id: conversationId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "API request failed");
        }

        const botMsg: Message = {
          id: "msg-" + (Date.now() + 1),
          role: "assistant",
          text: data.text || "分析完成，请查看上方结果。",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setStreamingId(botMsg.id);
        onStreamingChange?.(true);
        speakText(data.text);
      } catch (error: any) {
        console.error("Chatflow resume failed:", error);
        const errorMsg: Message = {
          id: "msg-err-" + Date.now(),
          role: "assistant",
          text: "抱歉，续接分析时出现了问题。请重新上传图片再试一次。",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        setStreamingId(errorMsg.id);
        onStreamingChange?.(true);
      } finally {
        setLoading(false);
      }
    })();
  };

  // Markdown rendering styling configuration that is highly readable on both light and dark backgrounds
  const getMarkdownComponents = (activeDarkMode: boolean, activeLargeFont: boolean) => ({
    p: ({ children }: any) => (
      <p className={`leading-relaxed mb-2.5 whitespace-pre-wrap ${
        activeLargeFont 
          ? "text-[15.5px] md:text-[17px] font-extrabold leading-loose" 
          : "text-[12.5px] leading-relaxed font-semibold"
      } ${
        activeDarkMode ? "text-white" : "text-stone-850"
      }`}>
        {children}
      </p>
    ),
    h1: ({ children }: any) => (
      <h1 className={`font-black tracking-wider border-b pb-2.5 mt-5 mb-4 flex items-center gap-1.5 ${
        activeLargeFont ? "text-lg md:text-xl" : "text-sm md:text-base"
      } ${
        activeDarkMode ? "text-emerald-300 border-emerald-800/60" : "text-emerald-950 border-emerald-100"
      }`}>
        【{children}】
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className={`font-black tracking-wider border-b pb-2 mt-4.5 mb-3 flex items-center gap-1 ${
        activeLargeFont ? "text-base md:text-lg" : "text-xs md:text-sm font-bold"
      } ${
        activeDarkMode ? "text-emerald-400 border-emerald-850/40" : "text-emerald-900 border-emerald-100"
      }`}>
        【{children}】
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className={`font-extrabold flex items-center gap-1.5 mt-3.5 mb-2 ${
        activeLargeFont ? "text-base" : "text-xs font-bold"
      } ${
        activeDarkMode ? "text-emerald-300" : "text-emerald-850"
      }`}>
        <Sparkles className={`text-emerald-500 shrink-0 ${activeLargeFont ? "w-4 h-4" : "w-3.5 h-3.5"}`} />
        {children}
      </h3>
    ),
    ul: ({ children }: any) => (
      <ul className="space-y-1.5 my-2.5 pl-1 list-none">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className={`list-decimal space-y-1.5 my-2.5 pl-5 ${
        activeDarkMode ? "text-white" : "text-stone-800"
      }`}>
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className={`flex gap-2 items-start my-1 ${
        activeLargeFont 
          ? "text-[14.5px] md:text-[15.5px] font-extrabold leading-loose" 
          : "text-[12px] font-medium leading-relaxed"
      } ${
        activeDarkMode ? "text-white" : "text-stone-750"
      }`}>
        <span className={`text-emerald-500 shrink-0 select-none ${
          activeLargeFont ? "text-lg mt-0.5" : "text-[12px] mt-0.5"
        }`}>❧</span>
        <span className="flex-1">{children}</span>
      </li>
    ),
    strong: ({ children }: any) => (
      <strong className={`rounded mx-[2px] font-black ${
        activeDarkMode 
          ? "text-yellow-350 bg-emerald-950/90 px-1.5 py-0.5 border border-emerald-800/40" 
          : "text-emerald-950 bg-emerald-100/50 px-1.5 py-0.5"
      }`}>
        {children}
      </strong>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className={`border-l-4 rounded-r-xl p-4 my-4 font-serif text-left ${
        activeDarkMode 
          ? "border-emerald-600 bg-emerald-950/30 text-stone-200" 
          : "border-emerald-700 bg-emerald-50/50 text-stone-850"
      }`}>
        {children}
      </blockquote>
    ),
    code: ({ inline, className, children, ...props }: any) => {
      return (
        <code className={`font-mono text-xs p-1 rounded ${
          activeDarkMode ? "bg-stone-900/80 text-emerald-300" : "bg-stone-100 text-stone-800"
        }`} {...props}>
          {children}
        </code>
      );
    },
    table: ({ children }: any) => (
      <div className={`overflow-x-auto my-3 rounded-lg border ${
        activeDarkMode ? 'border-emerald-800/40' : 'border-stone-200'
      }`}>
        <table className={`w-full text-left border-collapse ${
          activeLargeFont ? "text-sm" : "text-xs"
        }`}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className={`${
        activeDarkMode ? "bg-emerald-950/60" : "bg-emerald-50/80"
      }`}>
        {children}
      </thead>
    ),
    tbody: ({ children }: any) => (
      <tbody className={`divide-y ${
        activeDarkMode ? "divide-emerald-800/30" : "divide-stone-100"
      }`}>
        {children}
      </tbody>
    ),
    tr: ({ children }: any) => (
      <tr className={`transition-colors ${
        activeDarkMode ? "hover:bg-emerald-950/30" : "hover:bg-emerald-50/50"
      }`}>
        {children}
      </tr>
    ),
    th: ({ children }: any) => (
      <th className={`px-3 py-2 font-black text-left whitespace-nowrap ${
        activeLargeFont ? "text-sm" : "text-xs"
      } ${
        activeDarkMode ? "text-emerald-300" : "text-emerald-900"
      }`}>
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className={`px-3 py-2 ${
        activeLargeFont ? "text-sm font-bold" : "text-xs"
      } ${
        activeDarkMode ? "text-stone-200" : "text-stone-700"
      }`}>
        {children}
      </td>
    ),
  });

  // Lexical Typewriter renderer to feed character intervals dynamically with full markdown support
  const TypewriterRenderer = ({ text, onComplete }: { text: string; onComplete: () => void }) => {
    const [visibleLength, setVisibleLength] = useState(0);

    useEffect(() => {
      setVisibleLength(0);
      let active = true;
      let currentLength = 0;
      
      const interval = setInterval(() => {
        if (!active) return;
        currentLength += 2; // Speed: prints 2 characters every 12ms
        if (currentLength >= text.length) {
          setVisibleLength(text.length);
          clearInterval(interval);
          onComplete();
        } else {
          setVisibleLength(currentLength);
        }
      }, 12);

      return () => {
        active = false;
        clearInterval(interval);
      };
    }, [text]);

    const visibleText = text.substring(0, visibleLength);
    const activeDarkMode = isDarkMode || false;
    
    return (
      <div className="markdown-body">
        <Markdown remarkPlugins={[remarkGfm]} components={getMarkdownComponents(activeDarkMode, isLargeFont)}>{visibleText}</Markdown>
      </div>
    );
  };

  return (
    <div className={`backdrop-blur-md flex flex-col relative overflow-hidden transition-all duration-300 border shadow-md ${
      isDarkMode 
        ? "bg-[#06140edd]/90 border-emerald-950 shadow-emerald-950/40 text-stone-100" 
        : "bg-white/95 border-2 border-emerald-100 shadow-md text-stone-800"
    } ${
      isLargeFont ? "h-[740px] rounded-[40px] p-8" : "h-[660px] rounded-[32px] p-6"
    }`}>
      
      {/* Background elegant faint pattern representing traditional herbal diagram */}
      <div className="absolute top-[30%] right-[-10%] opacity-[0.03] select-none pointer-events-none text-9xl">
        🍁
      </div>

      {/* Consultant Header */}
      <div className={`flex justify-between items-center pb-3 shrink-0 border-b ${
        isDarkMode ? "border-emerald-900/40" : "border-stone-100"
      }`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`rounded-full flex items-center justify-center shadow-inner border ${
              isDarkMode ? "bg-emerald-950 border-emerald-800/40" : "bg-[#eef7f2] border-emerald-100"
            } ${
              isLargeFont ? "w-14 h-14 text-3xl" : "w-12 h-12 text-2xl"
            }`}>
              {moduleNames[activeModule].icon}
            </div>
            {/* Active pulse breath dot */}
            <span className={`absolute bg-emerald-500 border-2 rounded-full animate-pulse ${
              isDarkMode ? "border-stone-900" : "border-white"
            } ${
              isLargeFont ? "-bottom-0.5 -right-0.5 w-4 h-4" : "-bottom-0.5 -right-0.5 w-3.5 h-3.5"
            }`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className={`font-black ${
                isDarkMode ? "text-emerald-100" : "text-stone-800"
              } ${
                isLargeFont ? "text-lg" : "text-base"
              }`}>
                灵枢·{moduleNames[activeModule].label}顾问
              </h2>
            </div>
            {!isLargeFont && (
              <p className={`text-[10px] font-semibold mt-0.5 ${
                isDarkMode ? "text-stone-400" : "text-stone-400"
              }`}>中医养生 · AI 健康顾问</p>
            )}
          </div>
        </div>

        {/* TTS Toggle */}
        <button
          id="toggle-speak-btn"
          onClick={toggleTts}
          title={isTtsEnabled ? "开启了语音播报" : "关闭了语音播报"}
          className={`font-black transition-all cursor-pointer flex items-center gap-1.5 border ${
            isLargeFont 
              ? "p-3.5 rounded-[20px] text-sm" 
              : "p-2.5 rounded-2xl text-xs"
          } ${
            isTtsEnabled 
              ? "bg-emerald-700 border-emerald-750 text-white shadow-xs" 
              : isDarkMode 
                ? "bg-emerald-950/40 border-emerald-900/30 text-stone-400 hover:text-emerald-300"
                : "bg-stone-50 border-stone-200 text-stone-500 hover:text-emerald-700"
          }`}
        >
          {isTtsEnabled ? <Volume2 className={isLargeFont ? "w-5 h-5" : "w-4 h-4"} /> : <VolumeX className={isLargeFont ? "w-5 h-5" : "w-4 h-4"} />}
          <span>{isTtsEnabled ? "开启诵答" : "静音调理"}</span>
        </button>
      </div>

      {/* Messages thread pane */}
      <div className={`flex-1 overflow-y-auto pr-1 py-3 no-scrollbar ${
        isLargeFont ? "space-y-6" : "space-y-4"
      }`}>
        {messages.map((msg) => {
          const isMe = msg.role === "user";
          let displayedText = msg.text;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[90%] ${
                isMe ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* Avatar */}
              <div className={`rounded-full border shadow-2xs flex items-center justify-center shrink-0 leading-none select-none ${
                isLargeFont ? "w-11 h-11 text-xl" : "w-9 h-9 text-base"
              } ${
                isMe 
                  ? isDarkMode
                    ? "bg-[#33220e] border-amber-800/40 text-amber-400"
                    : "bg-amber-100 border-amber-200 text-amber-800"
                  : isDarkMode
                    ? "bg-[#143022] border-emerald-700/50 text-emerald-300"
                    : "bg-emerald-50 border-emerald-250 text-emerald-700"
              }`}>
                {isMe ? (
                  <User className={isLargeFont ? "w-5 h-5" : "w-4 h-4"} />
                ) : (
                  <span style={{ fontStyle: "normal" }}>🧙‍♂️</span>
                )}
              </div>

              {/* Msg Content */}
              <div className="flex flex-col">
                <div className={`shadow-3xs border ${
                  isLargeFont ? "rounded-[26px] p-5.5" : "rounded-2xl p-4"
                } ${
                  isMe 
                    ? isDarkMode
                      ? "bg-[#33220e] text-amber-50 border-amber-800/40 font-bold"
                      : "bg-amber-50 text-stone-900 border border-amber-205/60 font-bold" 
                    : isDarkMode
                      ? "bg-[#153122] border border-emerald-800/50 text-stone-100"
                      : "bg-emerald-50/50 border border-emerald-150 text-stone-850"
                }`}>
                  
                  {/* If user uploads attachment, render preview */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {msg.attachments.map((att, aIdx) => (
                        <div key={aIdx} className="relative rounded-lg overflow-hidden border border-stone-200/60 max-w-[150px] bg-white p-1">
                          {att.mimeType.startsWith("image") ? (
                            <img
                              src={att.url || `data:${att.mimeType};base64,${att.data}`}
                              alt={att.name}
                              referrerPolicy="no-referrer"
                              className={isLargeFont ? "w-32 h-32 object-cover rounded" : "w-24 h-24 object-cover rounded"}
                            />
                          ) : (
                            <div className="flex items-center gap-1.5 p-2 bg-stone-50 rounded">
                              <FileText className="w-4 h-4 text-stone-500" />
                              <span className="text-[10px] font-bold text-stone-600 truncate max-w-[80px]">
                                {att.name}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {isMe ? (
                    <p className={`leading-relaxed whitespace-pre-wrap ${
                      isLargeFont ? "text-[15px] md:text-[16px] font-extrabold leading-loose" : "text-xs font-bold"
                    } ${
                      isDarkMode ? "text-amber-100" : "text-amber-950"
                    }`}>
                      {displayedText}
                    </p>
                  ) : (
                    <>
                      {msg.id === streamingId ? (
                        <TypewriterRenderer
                          text={displayedText}
                          onComplete={() => {
                            setStreamingId(null);
                            onStreamingChange?.(false);
                          }}
                        />
                      ) : (
                        <div className="markdown-body">
                          <Markdown remarkPlugins={[remarkGfm]} components={getMarkdownComponents(isDarkMode || false, isLargeFont)}>{displayedText}</Markdown>
                        </div>
                      )}
                      {/* Chatflow 选择按钮 */}
                      {msg.choices && msg.choices.length > 0 && msg.chatflowConversationId && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {msg.choices.map((choice, cIdx) => (
                            <button
                              key={cIdx}
                              onClick={() => handleChoiceClick(choice, msg.chatflowConversationId!)}
                              disabled={loading}
                              className={`font-extrabold border-2 transition-all cursor-pointer ${
                                isLargeFont
                                  ? "text-sm px-5 py-3 rounded-2xl"
                                  : "text-xs px-4 py-2.5 rounded-xl"
                              } ${
                                isDarkMode
                                  ? "bg-emerald-950/60 border-emerald-700/50 text-emerald-200 hover:bg-emerald-800/50 hover:border-emerald-500"
                                  : "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-500"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {choice}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {/* Meta Timestamp */}
                <span className={`text-[9px] text-stone-400 mt-1 font-bold ${isMe ? "text-right" : "text-left"}`}>
                  {msg.timestamp.toLocaleTimeString("zh-CN", { hour: "numeric", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading Spinner Bubble */}
        {loading && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
            <div className={`rounded-full border flex items-center justify-center shrink-0 leading-none select-none ${
              isLargeFont ? "w-11 h-11 text-xl" : "w-9 h-9 text-base"
            } ${
              isDarkMode 
                ? "border-emerald-800/50 bg-[#143022] text-emerald-300"
                : "border-emerald-200/50 bg-emerald-50 text-emerald-800"
            }`}>
              <span style={{ fontStyle: "normal" }}>🧙‍♂️</span>
            </div>
            <div className={`border rounded-3xl p-4 flex flex-col gap-1.5 shadow-5xs ${
              isLargeFont ? "p-5.5 rounded-[26px]" : "p-4"
            } ${
              isDarkMode 
                ? "bg-[#153122] border border-emerald-800/50 text-stone-100"
                : "bg-white border border-emerald-100 text-emerald-850"
            }`}>
              <span className={`font-black animate-pulse flex items-center gap-1.5 ${
                isLargeFont ? "text-sm" : "text-[11px]"
              } ${isDarkMode ? "text-emerald-300" : "text-emerald-850"}`}>
                <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-bounce" />
                健康顾问正在分析中...
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Voice feedback waves while recording */}
      {isRecording && (
        <div className={`border rounded-2xl p-2.5 mx-1 mb-2 flex items-center justify-between shrink-0 ${
          isDarkMode ? "bg-red-950/40 border-red-900/50" : "bg-red-50 border border-red-100"
        }`}>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className={`text-xs font-black ${isDarkMode ? "text-red-300" : "text-red-800"}`}>正在聆听您的描述...</span>
          </div>
          <div className="flex items-end gap-0.5 h-4">
            <div className="w-0.5 bg-red-500 h-2 animate-[pulse_0.4s_infinite_alternate]" />
            <div className="w-0.5 bg-red-500 h-4 animate-[pulse_0.6s_infinite_alternate_0.1s]" />
            <div className="w-0.5 bg-red-500 h-1 animate-[pulse_0.3s_infinite_alternate_0.2s]" />
            <div className="w-0.5 bg-red-500 h-3 animate-[pulse_0.5s_infinite_alternate_0.15s]" />
          </div>
        </div>
      )}

      {/* Paste Notification Hint */}
      {pasteNotification && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-stone-800/95 text-stone-100 text-[11px] font-black px-4 py-1.5 rounded-full shadow-lg z-20 flex items-center gap-1 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          {pasteNotification}
        </div>
      )}

      {/* Attachment Buffer Strip display */}
      {attachments.length > 0 && (
        <div className={`border rounded-xl p-2 mx-1 mb-2 flex gap-2 overflow-x-auto shrink-0 no-scrollbar ${
          isDarkMode ? "bg-[#0b1b14] border-emerald-950" : "bg-[#f2f8f5] border border-emerald-100"
        }`}>
          {attachments.map((att, idx) => (
            <div key={idx} className={`relative border rounded-lg p-1.5 flex items-center gap-1.5 group shrink-0 ${
              isDarkMode ? "bg-stone-900 border-stone-850" : "bg-white border border-stone-200"
            }`}>
              {att.mimeType.startsWith("image") ? (
                <img
                  src={att.url}
                  alt={att.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <div className="w-10 h-10 flex items-center justify-center bg-stone-100 dark:bg-stone-800 rounded text-stone-500 dark:text-stone-400 text-xs">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              <span className="text-[10px] font-bold text-stone-600 dark:text-stone-300 max-w-[60px] truncate">{att.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
                title="移除附件"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Chat bottom action panel input */}
      <form onSubmit={handleFormSubmit} className={`flex gap-2 pt-2.5 shrink-0 border-t ${
        isDarkMode ? "border-emerald-900/40" : "border-stone-100"
      }`}>
        
        {/* Hidden File Input Selector */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          className="hidden"
        />

        {/* File/Image Upload Button */}
        <button
          type="button"
          id="btn-upload-file"
          onClick={() => activeModule === "surprise" && fileInputRef.current?.click()}
          title={activeModule === "surprise" ? "上传文件/舌苔/食物照片" : "当前模块不支持上传文件"}
          disabled={activeModule !== "surprise"}
          className={`transition-colors flex items-center justify-center shrink-0 focus:outline-none focus:ring-0 border ${
            isLargeFont ? "p-4 rounded-[22px]" : "p-3 rounded-2xl"
          } ${
            activeModule !== "surprise"
              ? "opacity-40 cursor-not-allowed bg-stone-100 border-stone-200 text-stone-400"
              : isDarkMode
                ? "bg-[#0c2217] border-emerald-900/45 text-stone-300 hover:text-emerald-400 hover:border-emerald-800 cursor-pointer"
                : "bg-stone-50 border-stone-200 text-stone-600 hover:text-emerald-700 hover:border-emerald-200 cursor-pointer"
          }`}
        >
          <Paperclip className={isLargeFont ? "w-5.5 h-5.5" : "w-4.5 h-4.5"} />
        </button>

        {/* Voice recording activator button */}
        <button
          type="button"
          id="btn-voice-record"
          onClick={() => activeModule === "surprise" && toggleRecording()}
          title={activeModule === "surprise" ? (isRecording ? "点击结束录音" : "按语音输入") : "当前模块不支持语音输入"}
          disabled={activeModule !== "surprise"}
          className={`transition-all flex items-center justify-center shrink-0 focus:outline-none focus:ring-0 border ${
            isLargeFont ? "p-4 rounded-[22px]" : "p-3 rounded-2xl"
          } ${
            activeModule !== "surprise"
              ? "opacity-40 cursor-not-allowed bg-stone-100 border-stone-200 text-stone-400"
              : isRecording
                ? "bg-red-500 text-white border-red-500 hover:bg-red-600 animate-pulse cursor-pointer"
                : isDarkMode
                  ? "bg-[#0c2217] border-emerald-900/45 text-stone-300 hover:text-emerald-400 hover:border-emerald-800 cursor-pointer"
                  : "bg-stone-50 border-stone-200 text-stone-600 hover:text-emerald-700 hover:border-emerald-200 cursor-pointer"
          }`}
        >
          {isRecording ? <MicOff className={isLargeFont ? "w-5.5 h-5.5" : "w-4.5 h-4.5"} /> : <Mic className={isLargeFont ? "w-5.5 h-5.5" : "w-4.5 h-4.5"} />}
        </button>

        {/* Main Text input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPaste={handlePaste}
          placeholder={isRecording ? (isLargeFont ? "正在聆听，请说话..." : "正在聆听，请描述您的状况...") : (isLargeFont ? moduleNames[activeModule].placeholderLarge : moduleNames[activeModule].placeholder)}
          disabled={loading}
          className={`flex-1 focus:ring-2 focus:outline-none font-black transition-all border-2 ${
            isDarkMode
              ? "bg-black/60 hover:bg-black/80 border-stone-850 focus:ring-emerald-900/50 focus:border-emerald-400 text-stone-100"
              : "bg-stone-50/50 hover:bg-white border-stone-100 hover:border-emerald-200 focus:ring-emerald-200/50 focus:border-emerald-500 text-stone-800 focus:bg-white"
          } ${
            isLargeFont ? "text-[15px] px-5 py-4.5 rounded-[22px]" : "text-xs px-4 py-3 rounded-2xl"
          }`}
        />

        {/* Submit */}
        <button
          type="submit"
          id="btn-send-message"
          disabled={loading || (!input.trim() && attachments.length === 0)}
          className={`bg-emerald-750 hover:bg-emerald-850 text-white font-extrabold transition-all disabled:opacity-45 flex items-center justify-center shrink-0 cursor-pointer focus:outline-none focus:ring-0 shadow-xs ${
            isLargeFont ? "p-4.5 rounded-[22px]" : "p-3 rounded-2xl"
          }`}
        >
          <Send className={isLargeFont ? "w-5.5 h-5.5" : "w-4.5 h-4.5"} />
        </button>
      </form>
    </div>
  );
}
