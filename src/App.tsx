import React, { useState, useEffect } from "react";
import { 
  Flame, Compass, BarChart2, Calendar, Sliders, Sun, Moon, 
  BookOpen, Play, CheckCircle2, ChevronRight, HelpCircle 
} from "lucide-react";
import { loadAbhyasaData, saveAbhyasaData, getLocalDateString, calculateGlobalStreak } from "./utils/storage";
import { AbhyasaData, Skill, UserSettings } from "./types";

// Component imports
import { GitaCard } from "./components/GitaCard";
import { SkillList } from "./components/SkillList";
import { SkillDetail } from "./components/SkillDetail";
import { VisualCharts } from "./components/VisualCharts";
import { CalendarHeatmap } from "./components/CalendarHeatmap";
import { Settings } from "./components/Settings";

export default function App() {
  const [data, setData] = useState<AbhyasaData | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"home" | "analytics" | "calendar" | "settings">("home");

  // Load state or fallback defaults on mount
  useEffect(() => {
    const loaded = loadAbhyasaData();
    setData(loaded);

    // Apply native HTML classes for dark/bright modes
    if (loaded.settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Select the first focus skill or first active skill by default
    const active = loaded.skills.filter(s => !s.isArchived);
    if (active.length > 0) {
      const pinned = active.find(s => s.isPinned);
      setSelectedSkillId(pinned ? pinned.id : active[0].id);
    }
  }, []);

  // Sync checkboxes daily at midnight
  useEffect(() => {
    if (!data) return;
    const todayStr = getLocalDateString();
    const lastCheckedDate = localStorage.getItem("@abhyasa:last_task_cycle_date");

    if (lastCheckedDate && lastCheckedDate !== todayStr) {
      // Midnight cycle: clear completion checks to reset daily micro-routines
      const resetSkills = data.skills.map(skill => ({
         ...skill,
         tasks: skill.tasks.map(t => ({ ...t, completed: false }))
      }));
      const updated = { ...data, skills: resetSkills };
      setData(updated);
      saveAbhyasaData(updated);
    }
    localStorage.setItem("@abhyasa:last_task_cycle_date", todayStr);
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0d0f14] flex flex-col items-center justify-center text-white">
        <Flame className="w-12 h-12 text-amber-500 animate-bounce mb-2" />
        <span className="font-mono text-xs text-slate-500">Loading Abhyasa Ledgers...</span>
      </div>
    );
  }

  const todayStr = getLocalDateString();
  const globalStreak = calculateGlobalStreak(data.skills, todayStr);

  // Persistence triggers
  const handleUpdateSettings = (updatedFields: Partial<UserSettings>) => {
    const nextSettings = { ...data.settings, ...updatedFields };
    const nextData = { ...data, settings: nextSettings };
    setData(nextData);
    saveAbhyasaData(nextData);
  };

  const handleUpdateSkills = (updatedSkills: Skill[]) => {
    const nextData = { ...data, skills: updatedSkills };
    setData(nextData);
    saveAbhyasaData(nextData);
  };

  const handleRestoreAllData = (restored: AbhyasaData) => {
    setData(restored);
    saveAbhyasaData(restored);
    if (restored.settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // 1. Add relative skill sādhanā
  const handleAddSkill = (name: string, icon: string, color: string) => {
    const newSkill: Skill = {
      id: `skill-${Date.now()}`,
      name,
      icon,
      color,
      createdAt: new Date().toISOString(),
      isPinned: false,
      isArchived: false,
      tasks: [],
      ratings: {}
    };

    const nextSkills = [...data.skills, newSkill];
    handleUpdateSkills(nextSkills);
    setSelectedSkillId(newSkill.id);
  };

  // 2. Toggle Pin/Unpin focus skill
  const handleTogglePin = (id: string) => {
    const updated = data.skills.map(skill => {
      if (skill.id === id) {
        return { ...skill, isPinned: !skill.isPinned };
      }
      return { ...skill, isPinned: false }; // only pin 1 skill as central focus
    });
    handleUpdateSkills(updated);
  };

  // 3. Update single skill properties (tasks list reorder, additions, etc.)
  const handleUpdateSingleSkill = (updated: Skill) => {
    const nextSkills = data.skills.map(s => s.id === updated.id ? updated : s);
    handleUpdateSkills(nextSkills);
  };

  // 4. Submit growth point rating for today
  const handleSubmitRating = (skillId: string, ratingValue: number) => {
    const updated = data.skills.map(skill => {
      if (skill.id === skillId) {
        return {
          ...skill,
          ratings: {
            ...skill.ratings,
            [todayStr]: ratingValue
          }
        };
      }
      return skill;
    });
    handleUpdateSkills(updated);
  };

  const selectedSkill = data.skills.find(s => s.id === selectedSkillId && !s.isArchived) 
    || data.skills.filter(s => !s.isArchived)[0];

  // Global Flame aesthetic gradient modifiers
  const getFlameColorClass = (streakValue: number) => {
    if (streakValue === 0) return "text-slate-400 drop-shadow-none";
    if (streakValue < 3) return "text-amber-500 drop-shadow-[0_0_8px_rgba(244,180,0,0.4)]";
    if (streakValue < 10) return "text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]";
    return "text-red-500 animate-pulse drop-shadow-[0_0_18px_rgba(239,68,68,0.7)]";
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${
      data.settings.darkMode 
        ? "bg-[#0d0f14] text-slate-100 animate-liquid bg-gradient-to-tr from-[#0d0f14] via-[#10192e] to-[#0d0f14]" 
        : "bg-[#f6f7fc] text-slate-800 animate-liquid bg-gradient-to-tr from-[#f6f7fc] via-[#eef2f6] to-[#f6f7fc]"
    }`}>
      {/* Container Wrapper */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-24 lg:mb-12">
        
        {/* TOP COMPASS HEADER SECTION */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#f4b400] to-[#ffd700] shadow-[0_0_15px_rgba(244,180,0,0.25)]">
              <span className="text-2xl">🕉️</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
                  Abhyasa
                </h1>
                <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-[#f4b400] bg-[#f4b400]/10 border border-[#f4b400]/25 px-2 py-0.5 rounded-full">
                  v1.2 Offline
                </span>
              </div>
              <p className="text-xs font-serif text-[#a0a5b5] italic mt-1 leading-none opacity-85">
                “कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।”
              </p>
            </div>
          </div>

          {/* Global Streak Flame Indicators */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl py-2.5 px-4 shadow-lg backdrop-blur-md">
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-mono font-bold text-slate-400 capitalize leading-none tracking-wider">Growth Streak</span>
              <span className="text-[10px] text-[#a0a5b5] mt-1">days consistent</span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
              <Flame className={`w-6 h-6 transition-transform hover:scale-110 ${getFlameColorClass(globalStreak)}`} />
              <span className="text-xl font-black font-mono text-slate-800 dark:text-white leading-none">
                {globalStreak}
              </span>
            </div>
          </div>
        </header>

        {/* WORKSPACE VIEWS */}
        <div>
          {/* TAB 1: 🕉️ Sadhana Home Dashboard */}
          {activeTab === "home" && (
            <div id="tab-home-pane" className="space-y-6">
              {/* Dynamic Bhagavad Gita Verse Panel */}
              <GitaCard 
                bookmarkedIds={data.settings.bookmarkedShlokas}
                onToggleBookmark={(id) => {
                  const current = data.settings.bookmarkedShlokas;
                  const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
                  handleUpdateSettings({ bookmarkedShlokas: next });
                }}
                soundEnabled={data.settings.notificationSound}
              />

              {/* TWO COLUMN VIEWPORT STRATEGY */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* COLUMN A: Active Skill Rings Panel (Takes 5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  <SkillList 
                    skills={data.skills}
                    selectedSkillId={selectedSkillId}
                    onSelectSkill={(id) => setSelectedSkillId(id)}
                    onAddSkill={handleAddSkill}
                    onTogglePin={handleTogglePin}
                  />
                </div>

                {/* COLUMN B: Interactive Track Detail Pane (Takes 7 cols) */}
                <div className="lg:col-span-7">
                  {selectedSkill ? (
                    <SkillDetail 
                      skill={selectedSkill}
                      strictMode={data.settings.strictMode}
                      onUpdateSkill={handleUpdateSingleSkill}
                      onSubmitRating={handleSubmitRating}
                    />
                  ) : (
                    <div className="rounded-2xl border border-white/10 dark:border-white/5 bg-white/5 dark:bg-slate-900/30 p-12 text-center text-xs text-slate-400 italic backdrop-blur-xl">
                      Select or initiate a skill discipline above to register daily tracks.
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: 📊 Growth Analytics Charts */}
          {activeTab === "analytics" && (
            <div id="tab-analytics-pane" className="space-y-4">
              {/* Dropdown to select focused trend skill */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 dark:bg-black/20 border border-white/5">
                <span className="text-xs font-mono text-slate-400">Select Analytics focus:</span>
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {data.skills.filter(s => !s.isArchived).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <VisualCharts 
                skills={data.skills}
                selectedSkillId={selectedSkillId}
              />
            </div>
          )}

          {/* TAB 3: 🗓️ Consistency heatmaps */}
          {activeTab === "calendar" && (
            <div id="tab-calendar-pane">
              <CalendarHeatmap skills={data.skills} />
            </div>
          )}

          {/* TAB 4: ⚙️ Setup Control Panel */}
          {activeTab === "settings" && (
            <div id="tab-settings-pane">
              <Settings 
                settings={data.settings}
                skills={data.skills}
                onUpdateSettings={handleUpdateSettings}
                onUpdateSkills={handleUpdateSkills}
                onRestoreAllData={handleRestoreAllData}
              />
            </div>
          )}
        </div>

      </div>

      {/* FIXED FOOTER NAVIGATION DOCK (RESPONSIVE VIEWPORT BOUNDS) */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-transparent py-4 px-6 pointer-events-none">
        <nav className="max-w-md mx-auto flex items-center justify-between gap-1 bg-white/85 dark:bg-slate-950/85 backdrop-blur-lg border border-white/10 rounded-full p-2 shadow-[0_10px_35px_rgba(0,0,0,0.3)] pointer-events-auto">
          
          {/* Node 1: Home dashboard */}
          <button
            id="nav-home-btn"
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-full transition-all cursor-pointer ${
              activeTab === "home"
                ? "text-slate-950 font-bold bg-[#f4b400] shadow-[0_0_12px_rgba(244,180,0,0.3)] scale-[1.03]"
                : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[9px] font-mono font-bold mt-1 uppercase tracking-wide">Sadhana</span>
          </button>

          {/* Node 2: Weekly charts */}
          <button
            id="nav-analytics-btn"
            onClick={() => setActiveTab("analytics")}
            className={`flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-full transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "text-slate-950 font-bold bg-[#f4b400] shadow-[0_0_12px_rgba(244,180,0,0.3)] scale-[1.03]"
                : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[9px] font-mono font-bold mt-1 uppercase tracking-wide">Trends</span>
          </button>

          {/* Node 3: Calendar grid */}
          <button
            id="nav-calendar-btn"
            onClick={() => setActiveTab("calendar")}
            className={`flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-full transition-all cursor-pointer ${
              activeTab === "calendar"
                ? "text-slate-950 font-bold bg-[#f4b400] shadow-[0_0_12px_rgba(244,180,0,0.3)] scale-[1.03]"
                : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[9px] font-mono font-bold mt-1 uppercase tracking-wide">Grid</span>
          </button>

          {/* Node 4: Settings config */}
          <button
            id="nav-settings-btn"
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-full transition-all cursor-pointer ${
              activeTab === "settings"
                ? "text-slate-950 font-bold bg-[#f4b400] shadow-[0_0_12px_rgba(244,180,0,0.3)] scale-[1.03]"
                : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sliders className="w-5 h-5" />
            <span className="text-[9px] font-mono font-bold mt-1 uppercase tracking-wide">Controls</span>
          </button>

        </nav>
      </footer>
    </div>
  );
}
