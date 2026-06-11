import React, { useState } from "react";
import { 
  Check, Play, ArrowUp, ArrowDown, Trash2, Copy, Plus, 
  Flame, CheckCircle, Info, Sparkles, HelpCircle 
} from "lucide-react";
import { Skill, DailyTask } from "../types";
import { getLocalDateString } from "../utils/storage";

interface SkillDetailProps {
  skill: Skill;
  strictMode: boolean;
  onUpdateSkill: (updatedSkill: Skill) => void;
  onSubmitRating: (skillId: string, ratingValue: number) => void;
}

export const SkillDetail: React.FC<SkillDetailProps> = ({
  skill,
  strictMode,
  onUpdateSkill,
  onSubmitRating,
}) => {
  const [newTaskText, setNewTaskText] = useState("");
  const [sliderValue, setSliderValue] = useState(0.0);
  const [celebrate, setCelebrate] = useState(false);

  const todayStr = getLocalDateString();
  const todayRating = skill.ratings[todayStr];
  const isRatedToday = todayRating !== undefined && todayRating > 0;

  // Task analytical math
  const totalTasks = skill.tasks.length;
  const completedTasks = skill.tasks.filter((t) => t.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Strict mode: rating is locked if strictMode is on and 0 tasks are completed
  const isRatingLocked = strictMode && completedTasks === 0 && !isRatedToday;

  // Task interactions
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: DailyTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: newTaskText.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedSkill = {
      ...skill,
      tasks: [...skill.tasks, newTask],
    };
    onUpdateSkill(updatedSkill);
    setNewTaskText("");
  };

  const handleToggleTask = (taskId: string) => {
    const updatedTasks = skill.tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });

    onUpdateSkill({ ...skill, tasks: updatedTasks });
  };

  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedTasks = skill.tasks.filter((t) => t.id !== taskId);
    onUpdateSkill({ ...skill, tasks: updatedTasks });
  };

  const handleDuplicateTask = (task: DailyTask, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated: DailyTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: `${task.text} (copy)`,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTasks = [...skill.tasks, duplicated];
    onUpdateSkill({ ...skill, tasks: updatedTasks });
  };

  // Reordering indicators
  const handleReorderTask = (index: number, direction: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    const list = [...skill.tasks];
    const targetIdx = direction === "up" ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= list.length) return;

    // Swap position indices
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    onUpdateSkill({ ...skill, tasks: list });
  };

  // Submit growth tracking rating of today
  const handleRatingSubmit = () => {
    if (isRatingLocked) return;
    onSubmitRating(skill.id, sliderValue);
    setCelebrate(true);
    setTimeout(() => {
      setCelebrate(false);
    }, 2800);
  };

  // SVG Radial Ring mathematical properties
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  // Mini Sparkline Math: Last 7 entry outputs
  const getSparklinePoints = (): string => {
    const dates: string[] = [];
    const today = new Date();
    // last 7 calendar days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${day}`);
    }

    const sparkWidth = 200;
    const sparkHeight = 50;
    const padding = 5;

    const points = dates.map((date, idx) => {
      const r = skill.ratings[date] || 0;
      const x = padding + (idx / 6) * (sparkWidth - padding * 2);
      const y = sparkHeight - padding - r * (sparkHeight - padding * 2);
      return `${x},${y}`;
    });

    return points.join(" ");
  };

  // Render skill background gradient presets
  const getGradientClass = (color: string) => {
    switch (color) {
      case "gold": return "from-amber-600/25 via-yellow-600/10 to-transparent";
      case "mint": return "from-emerald-600/25 via-teal-600/10 to-transparent";
      case "purple": return "from-purple-600/25 via-indigo-600/10 to-transparent";
      case "rose": return "from-rose-600/25 via-pink-600/10 to-transparent";
      case "cyan": return "from-cyan-600/25 via-sky-600/10 to-transparent";
      default: return "from-blue-600/25 via-indigo-600/10 to-transparent";
    }
  };

  const getBorderColorClass = (color: string) => {
    switch (color) {
      case "gold": return "border-amber-500/20 shadow-amber-500/5";
      case "mint": return "border-emerald-500/20 shadow-emerald-500/5";
      case "purple": return "border-purple-500/20 shadow-purple-500/5";
      case "rose": return "border-rose-500/20 shadow-rose-500/5";
      case "cyan": return "border-cyan-500/20 shadow-cyan-500/5";
      default: return "border-blue-500/20 shadow-blue-500/5";
    }
  };

  const getAccentTextClass = (color: string) => {
    switch (color) {
      case "gold": return "text-amber-500";
      case "mint": return "text-emerald-400";
      case "purple": return "text-purple-400";
      case "rose": return "text-rose-400";
      case "cyan": return "text-cyan-400";
      default: return "text-blue-400";
    }
  };

  const getAccentBgClass = (color: string) => {
    switch (color) {
      case "gold": return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "mint": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "purple": return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
      case "rose": return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "cyan": return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      default: return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    }
  };

  return (
    <div 
      id={`skill-detail-panel-${skill.id}`}
      className={`relative overflow-hidden rounded-[32px] border bg-gradient-to-br from-white/10 to-white/5 bg-white/5 dark:bg-white/5 p-8 backdrop-blur-2xl transition hover:shadow-2xl shadow-xl ${getBorderColorClass(skill.color)}`}
    >
      {/* Visual celebration effects on successful submission */}
      {celebrate && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md text-center p-6">
          <Sparkles className="w-12 h-12 text-[#f4b400] animate-bounce mb-3" />
          <h4 className="text-xl font-bold text-white tracking-tight">Sādhanā Complete!</h4>
          <p className="text-xs text-[#a0a5b5] max-w-sm mt-1 leading-relaxed">
            "Your right is to the work itself, never to its dividends." Consistent effort registered!
          </p>
          <div className="mt-4 text-[10px] uppercase font-mono tracking-widest text-[#00c9a7] bg-[#00c9a7]/10 px-3 py-1 rounded-full animate-pulse border border-[#00c9a7]/20">
            +{(sliderValue * 100).toFixed(0)}% Growth Point Added
          </div>
        </div>
      )}

      {/* Detail Panel Title Module */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-6 border-b border-white/10 dark:border-white/5">
        <div className="flex items-center gap-4">
          {/* Circular SVG Completion Ring with Icon */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-white/5 dark:stroke-white/5 fill-transparent"
                strokeWidth="4"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                className={`fill-transparent transition-all duration-500`}
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ color: celebrate ? "#ef4444" : completionPercentage === 100 ? "#10b981" : "rgb(244 180 0 / 0.85)" }}
              />
            </svg>
            <span className={`text-xl ${getAccentTextClass(skill.color)}`}>
              ⚛️
            </span>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
              {skill.name}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-[10px] font-mono rounded px-2 py-0.5 ${getAccentBgClass(skill.color)}`}>
                Task Mastery: {completedTasks}/{totalTasks} ({completionPercentage}%)
              </span>
              {skill.isPinned && (
                <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  📌 Pinned Focus
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 7-day Mini Spark Line Trend */}
        <div className="flex flex-col self-start sm:self-auto border border-white/5 bg-black/15 rounded-lg p-2.5 max-w-[210px]">
          <span className="text-[9px] font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>7-Day Fast Trend</span>
            <span className="text-emerald-400 font-semibold text-right">Abhyasa Path</span>
          </span>
          <svg width="190" height="40" className="opacity-95">
            <polyline
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="1.5"
              strokeOpacity="0.15"
              points={getSparklinePoints()}
            />
            <polyline
              fill="none"
              stroke={celebrate ? "#10b981" : "rgb(244, 180, 0)"}
              strokeWidth="2"
              className="pulse"
              points={getSparklinePoints()}
            />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Daily Actions Checklist */}
        <div id="checklist-panel" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">
              Daily Actions Checklist
            </h3>
            <span className="text-[10px] text-slate-500">
              Tasks reset daily for consistent ritual practice
            </span>
          </div>

          {/* New Task Entry Form */}
          <form onSubmit={handleAddTask} className="flex gap-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Define a micro-action (e.g. Read 2 pages...)"
              className="flex-1 text-xs px-3 py-2 rounded-lg bg-black/15 border border-white/10 dark:border-white/5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
            <button
              id="submit-add-task"
              type="submit"
              className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/15 hover:bg-amber-500/20 transition-all font-mono text-xs flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          {/* Micro-task list with interactive action buttons */}
          <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
            {skill.tasks.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 italic bg-black/5 border border-dashed border-white/5 rounded-lg">
                No items added today. Write an actionable task above to begin.
              </div>
            ) : (
              skill.tasks.map((task, idx) => (
                <div 
                  key={task.id}
                  className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                    task.completed 
                      ? "bg-emerald-500/5 border-emerald-500/20 text-slate-400" 
                      : "bg-black/10 border-white/5 text-slate-200"
                  }`}
                  onClick={() => handleToggleTask(task.id)}
                >
                  <div className="flex items-center gap-3 cursor-pointer select-none max-w-[65%]">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      task.completed 
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" 
                        : "border-white/20 hover:border-amber-500"
                    }`}>
                      {task.completed && <Check className="w-3 h-3" />}
                    </div>
                    <span className={`text-xs break-words leading-tight ${task.completed ? "line-through text-slate-500 italic" : ""}`}>
                      {task.text}
                    </span>
                  </div>

                  {/* Reorder and management tray */}
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-auto">
                    {/* Up Arrow */}
                    <button
                      onClick={(e) => handleReorderTask(idx, "up", e)}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-400 hover:text-slate-100 transition disabled:opacity-20"
                      title="Move up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    {/* Down Arrow */}
                    <button
                      onClick={(e) => handleReorderTask(idx, "down", e)}
                      disabled={idx === skill.tasks.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-slate-100 transition disabled:opacity-20"
                      title="Move down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    {/* Duplicate duplicate */}
                    <button
                      onClick={(e) => handleDuplicateTask(task, e)}
                      className="p-1 rounded text-slate-400 hover:text-emerald-400 transition"
                      title="Duplicate task"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={(e) => handleDeleteTask(task.id, e)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
                      title="Delete task"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Daily Growth Rating submission slider */}
        <div id="ratings-track-panel" className="space-y-5 rounded-xl bg-black/10 border border-white/5 p-5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-amber-500/10 text-amber-500">
              <Flame className="w-4 h-4" />
            </span>
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">
              Daily growth increment
            </h3>
          </div>

          {isRatedToday ? (
            /* Completed view for today */
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-400 animate-pulse mb-3" />
              <h4 className="text-sm font-semibold text-white">Daily Rating Logged</h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                You successfully logged <strong className="text-emerald-400 font-mono">+{(todayRating * 100).toFixed(0)}%</strong> incremental skill expansion today.
              </p>
              <button
                id="overwrite-rating-switch"
                onClick={() => {
                  setSliderValue(todayRating);
                  // Make editable by clearing today's recorded rating temporarily in state until save
                  onUpdateSkill({
                    ...skill,
                    ratings: {
                      ...skill.ratings,
                      [todayStr]: 0 // temporary reset in state for manual edit
                    }
                  });
                }}
                className="text-[10px] text-amber-500/80 hover:text-amber-400 uppercase tracking-wider font-mono mt-4 underline"
              >
                Re-adjust growth value
              </button>
            </div>
          ) : (
            /* Submission slider view */
            <div className="space-y-4">
              <div className="flex items-end justify-between border-b border-white/5 pb-2">
                <span className="text-[11px] text-slate-400 leading-none">Today's increment felt</span>
                {/* On-screen translation display translates slider to percentage */}
                <span className="text-2xl font-black font-mono text-amber-500 leading-none">
                  +{Math.round(sliderValue * 100)}%
                </span>
              </div>

              {isRatingLocked ? (
                /* Locked notification banner */
                <div className="p-4 border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs rounded-xl flex items-start gap-2.5 leading-normal">
                  <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold mb-0.5">Discipline Locked</strong>
                    Sadhana Strict Mode is active. Complete at least one micro-task on the left panel to unlock today's progress slider.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[11px] text-[#a0a5b5]/90 leading-relaxed font-sans mb-3">
                    Estimate your incremental self-study mastery expansion today on a scale of +0% to +100%. Moving the slider defines your rate.
                  </p>

                  {/* Real-time glowing progress track bar from the design mockup */}
                  <div className="h-2.5 bg-white/10 rounded-full relative overflow-hidden mb-4 mt-2 border border-white/5 shadow-inner">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#f4b400] to-[#ffd700] shadow-[0_0_15px_rgba(244,180,0,0.5)] transition-all duration-100" 
                      style={{ width: `${sliderValue * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-500">0.0</span>
                    <input
                      id="growth-slider-item"
                      type="range"
                      min="0.00"
                      max="1.00"
                      step="0.01"
                      value={sliderValue}
                      onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                      className="w-full h-1.5 rounded-lg bg-white/10 accent-[#f4b400] cursor-ew-resize focus:outline-none"
                    />
                    <span className="text-[10px] font-mono text-slate-500">1.0</span>
                  </div>

                  {/* Submission triggers celebration */}
                  <button
                    id="submit-rating-btn"
                    onClick={handleRatingSubmit}
                    className="w-full py-3 rounded-xl bg-[#f4b400] text-slate-950 font-black text-xs uppercase tracking-widest hover:bg-[#ffd700] cursor-pointer shadow-[0_0_15px_rgba(244,180,0,0.35)] transition-all active:scale-[0.98] duration-150 hover:scale-[1.01]"
                  >
                    Log Today's Growth (+{(sliderValue * 100).toFixed(0)}%)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Prompt info */}
          <div className="pt-3 border-t border-white/5 text-[10px] font-mono text-slate-500 leading-normal flex items-start gap-1">
            <HelpCircle className="w-3.5 h-3.5 stroke-[1.5] shrink-0" />
            <span>Sadhana tracking metrics represent incremental growth (e.g. +10% improvement feels like 0.10 points).</span>
          </div>
        </div>
      </div>
    </div>
  );
};
