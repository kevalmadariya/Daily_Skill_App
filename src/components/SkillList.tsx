import React, { useState } from "react";
import { 
  Plus, Pin, Archive, Trash2, Brain, Brush, Laptop, 
  TrendingUp, Activity, BookOpen, Music, Flame, Star, Sparkles
} from "lucide-react";
import { Skill } from "../types";
import { calculateSkillStreak, getLocalDateString } from "../utils/storage";

interface SkillListProps {
  skills: Skill[];
  selectedSkillId: string;
  onSelectSkill: (id: string) => void;
  onAddSkill: (name: string, icon: string, color: string) => void;
  onTogglePin: (id: string) => void;
}

// Map strings to Lucide icon components representing skill categories
export const getSkillIconComponent = (iconName: string, className = "w-4 h-4") => {
  switch (iconName) {
    case "Brain": return <Brain className={className} />;
    case "Brush": return <Brush className={className} />;
    case "Code": return <Laptop className={className} />;
    case "TrendingUp": return <TrendingUp className={className} />;
    case "Activity": return <Activity className={className} />;
    case "Book": return <BookOpen className={className} />;
    case "Music": return <Music className={className} />;
    default: return <Sparkles className={className} />;
  }
};

export const SkillList: React.FC<SkillListProps> = ({
  skills,
  selectedSkillId,
  onSelectSkill,
  onAddSkill,
  onTogglePin,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Brain");
  const [selectedColor, setSelectedColor] = useState("gold");

  const todayStr = getLocalDateString();
  const activeSkills = skills.filter((s) => !s.isArchived);

  // Sort: Pinned skills first, then by creation date desc
  const sortedSkills = [...activeSkills].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    onAddSkill(newSkillName.trim(), selectedIcon, selectedColor);
    setNewSkillName("");
    setShowAddForm(false);
  };

  // Helper color map
  const getAccentClass = (color: string) => {
    switch (color) {
      case "gold": return "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/15";
      case "mint": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15";
      case "purple": return "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/15";
      case "rose": return "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/15";
      case "cyan": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/15";
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/15";
    }
  };

  const getColorHex = (color: string) => {
    switch (color) {
      case "gold": return "#f4b400";
      case "mint": return "#00c9a7";
      case "purple": return "#a855f7";
      case "rose": return "#f43f5e";
      case "cyan": return "#06b6d4";
      default: return "#3d5afe";
    }
  };

  const iconPresets = ["Brain", "Brush", "Code", "TrendingUp", "Activity", "Book", "Music"];
  const colorPresets = [
    { name: "gold", label: "Golden Saffron", hex: "#f4b400" },
    { name: "mint", label: "Mint Tulasi", hex: "#00c9a7" },
    { name: "purple", label: "Midnight Indigo", hex: "#a855f7" },
    { name: "rose", label: "Lotus Rose", hex: "#f43f5e" },
    { name: "cyan", label: "Prana Cyan", hex: "#06b6d4" },
  ];

  return (
    <div id="skills-list-component" className="space-y-6">
      {/* List Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400 opacity-80">
          Actively Pursued Skills ({activeSkills.length})
        </h3>
        <button
          id="toggle-add-skill-form"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 text-xs text-[#f4b400] font-black bg-[#f4b400]/10 hover:bg-[#f4b400]/15 border border-[#f4b400]/20 py-2 px-4 rounded-full transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill</span>
        </button>
      </div>

      {/* Add Skill Form overlay panel */}
      {showAddForm && (
        <div id="add-skill-dialog" className="rounded-[32px] border border-white/10 dark:border-white/10 bg-white/5 backdrop-blur-2xl p-6 sm:p-8 transition shadow-2xl animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#f4b400]/5 rounded-full -mr-12 -mt-12 blur-2xl pointer-events-none"></div>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-white/10 tracking-tight">
              Initiate New Skill Discipline (Sādhanā)
            </h4>

            {/* Input Name */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Discipline / Skill Name
              </label>
              <input
                id="new-skill-input-name"
                type="text"
                required
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g. Stock Portfolios, Web Design, Sanskrit, Yoga"
                className="w-full text-xs px-4 py-2.5 rounded-xl bg-black/15 border border-white/10 dark:border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#f4b400]/50"
              />
            </div>

            {/* Presets icons */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Select Visual Identity Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {iconPresets.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer ${
                      selectedIcon === icon
                        ? "bg-[#f4b400]/25 text-[#f4b400] border-[#f4b400]/40 shadow-[0_0_12px_rgba(244,180,0,0.15)]"
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {getSkillIconComponent(icon, "w-4 h-4")}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets Color */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Assign Color Gradients
              </label>
              <div className="flex flex-wrap gap-2">
                {colorPresets.map((colorItem) => (
                  <button
                    key={colorItem.name}
                    type="button"
                    onClick={() => setSelectedColor(colorItem.name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-mono transition cursor-pointer ${
                      selectedColor === colorItem.name
                        ? "bg-white/10 text-white border-white/20"
                        : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
                    }`}
                    style={{ borderColor: selectedColor === colorItem.name ? colorItem.hex : "rgba(255,255,255,0.06)" }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorItem.hex }} />
                    <span>{colorItem.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-full text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                id="submit-skill-add-btn"
                type="submit"
                className="px-5 py-2.5 rounded-full bg-[#f4b400] text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-[#ffd700] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(244,180,0,0.3)]"
              >
                Add Skill
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid listing Active Skills (Skill Rings Row/Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedSkills.map((skill) => {
          const ratingToday = skill.ratings[todayStr] || 0;
          const isRated = ratingToday > 0;
          const streak = calculateSkillStreak(skill.ratings, todayStr);
          const points: number = Object.values(skill.ratings).reduce((a: number, b: number) => a + b, 0) as number;

          // SVG radial configuration
          const radiusStr = 22;
          const circ = 2 * Math.PI * radiusStr;
          const offset = circ - (ratingToday) * circ; // derived directly from today rating %

          const isSelected = skill.id === selectedSkillId;

          return (
            <div
              id={`skill-card-${skill.id}`}
              key={skill.id}
              onClick={() => onSelectSkill(skill.id)}
              className={`relative overflow-hidden rounded-3xl border transition-all cursor-pointer p-5 flex items-center justify-between gap-4 group ${
                isSelected
                  ? "bg-white/10 dark:bg-white/10 shadow-lg border-[#f4b400]/40 ring-1 ring-[#f4b400]/20 shadow-[0_0_20px_rgba(244,180,0,0.1)]"
                  : "bg-white/5 dark:bg-white/5 border-white/10 dark:border-white/10 hover:bg-white/10 hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-3.5 max-w-[65%]">
                {/* Micro Category Icon in custom glow circles like the Immersive design */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 transition-all group-hover:scale-110 ${
                  skill.color === "gold" ? "bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(244,180,0,0.15)]" :
                  skill.color === "mint" ? "bg-emerald-500/15 text-[#00c9a7] border-emerald-500/30 shadow-[0_0_12px_rgba(0,201,167,0.15)]" :
                  skill.color === "purple" ? "bg-purple-500/15 text-purple-400 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]" :
                  skill.color === "rose" ? "bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]" :
                  skill.color === "cyan" ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]" :
                  "bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-[0_0_12px_rgba(61,90,254,0.15)]"
                }`}>
                  {getSkillIconComponent(skill.icon, "w-4.5 h-4.5")}
                </div>

                <div className="truncate">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-gray-100 leading-snug flex items-center gap-1 truncate font-sans">
                    {skill.name}
                  </h4>
                  {/* Streak & points counter */}
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-[#a0a5b5] opacity-80">
                    <span className="flex items-center gap-0.5 text-[#f4b400]">
                      <Flame className={`w-3.5 h-3.5 fill-[#f4b400] text-[#f4b400] ${streak > 0 ? "animate-pulse" : ""}`} />
                      <strong className="font-bold">{streak} Days</strong>
                    </span>
                    <span>•</span>
                    <span className="font-semibold">{points.toFixed(1)} GP</span>
                  </div>
                </div>
              </div>

              {/* Progress Ring indicating today's tracking completion */}
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r={radiusStr}
                    className="stroke-white/5 fill-transparent"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r={radiusStr}
                    className="fill-transparent transition-all duration-300"
                    stroke={getColorHex(skill.color)}
                    strokeWidth="3.5"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                  />
                </svg>
                {/* On-ring percentage growth text */}
                <span className="relative text-[9px] font-mono font-bold text-slate-700 dark:text-gray-100">
                  {isRated ? `+${(ratingToday * 100).toFixed(0)}%` : "0%"}
                </span>
              </div>

              {/* Floating pin pin handle */}
              <button
                id={`pin-skill-${skill.id}-btn`}
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(skill.id);
                }}
                className={`absolute top-2.5 right-2.5 p-1 rounded-md transition-all ${
                  skill.isPinned ? "text-[#f4b400] opacity-100 scale-110" : "text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white"
                }`}
                title={skill.isPinned ? "Unpin Focus" : "Pin as Focus skill"}
              >
                <Pin className={`w-3 h-3 ${skill.isPinned ? "fill-[#f4b400]" : ""}`} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
