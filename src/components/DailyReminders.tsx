import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Circle, Plus, Trash2, CalendarCheck, Sparkles, AlertCircle } from "lucide-react";
import { ReminderItem } from "../types";
import { playSingingBowl } from "../utils/audio";

export default function DailyReminders() {
  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    const saved = localStorage.getItem("yiyang_daily_reminders");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse reminders:", e);
      }
    }
    // Pre-populated gentle TCM habits
    return [
      {
        id: "rem-1",
        title: "晨起温水润大肠",
        time: "06:30",
        category: "water",
        description: "卯时空腹喝250ml温水，清肠胃宿毒，润泽脏器。",
        completed: false,
      },
      {
        id: "rem-2",
        title: "辰时滋补胃元气",
        time: "08:00",
        category: "tea",
        description: "吃一顿温暖、软糯（小米粥、山药面）的高营养营养固元气早餐。",
        completed: false,
      },
      {
        id: "rem-3",
        title: "午饭闭目闭心觉",
        time: "12:15",
        category: "sleep",
        description: "午时小憩15-30分钟，合聚心神，中养脾阳。",
        completed: false,
      },
      {
        id: "rem-4",
        title: "申时推陈通百脉",
        time: "15:30",
        category: "exercise",
        description: "喝一大杯温润药茶，起身慢耸肩、拉伸腰背膀胱经络排毒。",
        completed: false,
      },
      {
        id: "rem-5",
        title: "暮夜养骨温足浴",
        time: "21:30",
        category: "meditation",
        description: "亥时艾草温水泡脚20分钟，促气血归脚，温肾安神提高睡眠。",
        completed: false,
      },
    ];
  });

  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("08:00");
  const [newCategory, setNewCategory] = useState<"tea" | "sleep" | "exercise" | "meditation" | "water">("tea");
  const [newDesc, setNewDesc] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("yiyang_daily_reminders", JSON.stringify(reminders));
  }, [reminders]);

  // Handle completion check back
  const handleToggleComplete = (id: string, currentlyCompleted: boolean) => {
    if (!currentlyCompleted) {
      // Shaman tone on completing habit
      playSingingBowl();
    }
    setReminders((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  // Handle Add Habit
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: ReminderItem = {
      id: "custom-" + Date.now(),
      title: newTitle,
      time: newTime,
      category: newCategory,
      description: newDesc.trim() ||"自订养生保健行为提醒，保持良好习惯哦。",
      completed: false,
      isCustom: true,
    };

    setReminders((prev) => [...prev, newItem]);
    setNewTitle("");
    setNewDesc("");
    setShowAddForm(false);
  };

  // Handle Delete Habit
  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((item) => item.id !== id));
  };

  // Reset completion rate for a new day
  const handleResetAll = () => {
    setReminders((prev) => prev.map((item) => ({ ...item, completed: false })));
  };

  // Calculate stats
  const totalCount = reminders.length;
  const completedCount = reminders.filter((r) => r.completed).length;
  const completionPercentage = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case "tea": return "🍵";
      case "water": return "🥛";
      case "sleep": return "🛌";
      case "exercise": return "🧘";
      case "meditation": return "🕯️";
      default: return "🌟";
    }
  };

  return (
    <div className="bg-stone-50/80 backdrop-blur-md rounded-3xl p-6 border border-stone-100 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-medium text-stone-800 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-[#6B8E23]" />
            今日个性养生提醒
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">点缀日常修行，打卡通幽，完成时鸣磬安神</p>
        </div>
        <button
          id="btn-show-add-habit"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#6B8E23]/10 text-[#6B8E23] text-xs font-bold px-3 py-1.5 rounded-full border border-[#6B8E23]/20 flex items-center gap-1 transition-all hover:bg-[#6B8E23]/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? "取消" : "添加自订"}</span>
        </button>
      </div>

      {/* Completion Percentage Progress Bar */}
      <div className="bg-white/80 border border-stone-100/80 p-4 rounded-2xl mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-stone-500">今日养生进度</span>
          <span className="text-xs font-bold text-[#6B8E23]">{completedCount} / {totalCount} 已达成 ({completionPercentage}%)</span>
        </div>
        <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden relative">
          <div
            className="bg-[#6B8E23] h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        
        {completionPercentage === 100 && (
          <div className="flex items-center gap-1.5 text-[#6B8E23] text-xs font-bold mt-2 animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            <span>澄怀观道，百脉皆通！今日养生大成，身心安然。</span>
          </div>
        )}
      </div>

      {/* Add reminder form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            onSubmit={handleAddReminder}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-stone-200/80 rounded-2xl p-4 mb-6 flex flex-col gap-4 shadow-sm"
          >
            <h4 className="text-sm font-bold text-stone-700 flex items-center gap-1">
              ✏️ 自订养生习惯
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-500 mb-1">习惯名称 (*)</label>
                <input
                  type="text"
                  required
                  placeholder="例如：餐后散步一千步"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-sm bg-stone-50 rounded-xl px-3 py-2 border border-stone-200 focus:outline-[#6B8E23]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-500 mb-1">提示时辰时间</label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="flex-1 text-sm bg-stone-50 rounded-xl px-3 py-2 border border-stone-200 focus:outline-[#6B8E23]"
                  />
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="bg-stone-50 rounded-xl px-2 py-2 text-sm border border-stone-200 focus:outline-[#6B8E23]"
                  >
                    <option value="tea">🍵 药茶</option>
                    <option value="water">🥛 适饮</option>
                    <option value="sleep">🛌 律息</option>
                    <option value="exercise">🧘 导引</option>
                    <option value="meditation">🕯️ 冥想</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-500 mb-1">小叙注解（养生原理/妙处）</label>
              <textarea
                rows={2}
                placeholder="例如：饭后散步，舒缓胃胀，平息肝气……"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full text-xs bg-stone-50 rounded-xl px-3 py-2 border border-stone-200 focus:outline-[#6B8E23]"
              />
            </div>

            <button
              type="submit"
              className="bg-[#6B8E23] hover:bg-[#5a7a1c] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs self-end flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> 保存并添加
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Habits List */}
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
        {reminders.map((item) => (
          <div
            key={item.id}
            id={`reminder-card-${item.id}`}
            className={`border rounded-2xl p-3.5 transition-all flex items-start gap-3 bg-white/90 ${
              item.completed
                ? "border-green-100 bg-[#6B8E23]/3 grayscale-[25%]"
                : "border-stone-100 hover:border-stone-200"
            }`}
          >
            {/* Checkbox button */}
            <button
              onClick={() => handleToggleComplete(item.id, item.completed)}
              className="mt-0.5 text-stone-400 hover:text-[#6B8E23] transition-colors focus:outline-none focus:ring-0"
              aria-label="Toggle Complete"
            >
              {item.completed ? (
                <CheckCircle2 className="w-5 h-5 text-[#6B8E23]" />
              ) : (
                <Circle className="w-5 h-5 text-stone-300" />
              )}
            </button>

            {/* Title / Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center gap-2">
                <span className={`text-[#6B8E23] text-sm font-bold flex items-center gap-1 leading-snug ${
                  item.completed ? "line-through text-stone-400 font-medium" : ""
                }`}>
                  <span className="text-base">{getCategoryEmoji(item.category)}</span>
                  <span>{item.title}</span>
                </span>
                
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="bg-stone-100 text-stone-500 border border-stone-200/50 text-[10px] font-bold px-2 py-0.5 rounded-md tabular-nums">
                    🕒 {item.time}
                  </span>
                  {item.isCustom && (
                    <button
                      id={`delete-reminder-${item.id}`}
                      onClick={() => handleDeleteReminder(item.id)}
                      className="p-1 text-stone-300 hover:text-red-500 rounded transition-colors"
                      title="删除此习惯"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className={`text-xs text-stone-500 mt-1 leading-relaxed ${
                item.completed ? "text-stone-400" : ""
              }`}>
                {item.description}
              </p>
            </div>
          </div>
        ))}

        {reminders.length === 0 && (
          <div className="text-center py-8 text-stone-400 bg-white/50 rounded-2xl border border-stone-100 flex flex-col items-center gap-1">
            <AlertCircle className="w-6 h-6 text-stone-300" />
            <p className="text-xs">暂无个性化日程提醒，您可以添加哦。</p>
          </div>
        )}
      </div>

      {completedCount > 0 && (
        <button
          id="btn-reset-reminders"
          onClick={handleResetAll}
          className="mt-4 text-[11px] text-stone-400 hover:text-stone-600 underline font-semibold transition-colors focus:ring-0"
        >
          重置今日所有打卡，开启新的一日运转。
        </button>
      )}
    </div>
  );
}
