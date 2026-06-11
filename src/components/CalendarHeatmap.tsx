import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Bookmark, CheckSquare } from "lucide-react";
import { Skill } from "../types";
import { getLocalDateString, addDays } from "../utils/storage";

interface CalendarHeatmapProps {
  skills: Skill[];
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ skills }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDayInfo, setSelectedDayInfo] = useState<{
    dateStr: string;
    ratings: { skillName: string; rating: number; color: string }[];
  } | null>(null);

  const activeSkills = skills.filter(s => !s.isArchived);

  // Month navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDayInfo(null);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDayInfo(null);
  };

  // Days in month logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // First day index (0: Sunday, 1: Monday, etc.)
    const startDayIndex = firstDay.getDay(); 
    const totalDays = lastDay.getDate();
    
    return { startDayIndex, totalDays };
  };

  const { startDayIndex, totalDays } = getDaysInMonth(currentMonth);

  // Generate date formats for checking ratings
  const buildDateKey = (dayNum: number): string => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const d = String(dayNum).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Helper: Retrieve ratings for a given date across active skills
  const getRatingsForDate = (dateStr: string) => {
    const results: { skillName: string; rating: number; color: string }[] = [];
    activeSkills.forEach(skill => {
      if (skill.ratings[dateStr] !== undefined && skill.ratings[dateStr] > 0) {
        results.push({
          skillName: skill.name,
          rating: skill.ratings[dateStr],
          color: skill.color
        });
      }
    });
    return results;
  };

  const handleTileClick = (dayNum: number) => {
    const dateStr = buildDateKey(dayNum);
    const dateRatings = getRatingsForDate(dateStr);
    setSelectedDayInfo({ dateStr, ratings: dateRatings });
  };

  // Theme support helpers
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

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const DAYS_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div id="calendar-heatmap-card" className="rounded-[32px] border border-white/10 dark:border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-2xl p-8 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-full bg-[#f4b400]/10 text-[#f4b400] border border-[#f4b400]/25">
            <Calendar className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white leading-none">
              Abhyasa Consistency Grid
            </h3>
            <p className="text-[11px] text-[#a0a5b5] mt-1.5 font-mono">
              Rated days glow in your active skill accents
            </p>
          </div>
        </div>

        {/* Calendar Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto border border-white/10 bg-black/15 rounded-full p-1 backdrop-blur-md">
          <button
            id="prev-month-btn"
            onClick={prevMonth}
            className="p-1.5 text-slate-400 hover:text-white transition-all hover:bg-white/5 rounded-full cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-300 min-w-[100px] text-center font-mono">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button
            id="next-month-btn"
            onClick={nextMonth}
            className="p-1.5 text-slate-400 hover:text-white transition-all hover:bg-white/5 rounded-full cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {DAYS_LABEL.map((lbl) => (
              <div key={lbl} className="text-center text-[10px] uppercase tracking-wider font-mono text-slate-500 py-1 font-semibold">
                {lbl}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank tiles before start of month */}
            {Array.from({ length: startDayIndex }).map((_, idx) => (
              <div 
                key={`empty-${idx}`} 
                className="aspect-square bg-transparent border border-transparent rounded-xl"
              />
            ))}

            {/* Days in month */}
            {Array.from({ length: totalDays }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = buildDateKey(dayNum);
              const dateRatings = getRatingsForDate(dateStr);
              const isToday = getLocalDateString() === dateStr;
              
              // Composite color for days with multiple ratings
              let tileStyle: React.CSSProperties = {};
              let hasRating = dateRatings.length > 0;
              
              if (hasRating) {
                if (dateRatings.length === 1) {
                  // Single skill rated on this day
                  const hex = getColorHex(dateRatings[0].color);
                  tileStyle = {
                    backgroundColor: `${hex}30`, // 18% opacity glow
                    borderColor: `${hex}60`, // 35% opacity border
                    boxShadow: `0 0 8px ${hex}15`
                  };
                } else {
                  // Multiple skills rated
                  const topHex = getColorHex(dateRatings[0].color);
                  tileStyle = {
                    background: `linear-gradient(135deg, ${getColorHex(dateRatings[0].color)}25, ${getColorHex(dateRatings[1].color)}25)`,
                    borderColor: `${topHex}65`,
                    boxShadow: `0 0 10px ${topHex}15`
                  };
                }
              }

              return (
                <button
                  key={`day-${dayNum}`}
                  onClick={() => handleTileClick(dayNum)}
                  className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center p-1 font-mono text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                    isToday 
                      ? "ring-2 ring-[#f4b400] text-slate-800 dark:text-white" 
                      : hasRating 
                        ? "text-slate-800 dark:text-gray-100 font-semibold"
                        : "bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.05]"
                  }`}
                  style={tileStyle}
                >
                  <span>{dayNum}</span>
                  {/* Glowing small micro dot if multiple ratings */}
                  {dateRatings.length > 1 && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white/70 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Panel */}
        <div id="calendar-details-panel" className="rounded-3xl bg-black/15 border border-white/10 p-5 flex flex-col justify-start">
          {selectedDayInfo ? (
            <div>
              <div className="flex items-center gap-2 border-b border-white/5 pb-2.5 mb-3">
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-slate-300 font-mono">
                  Report for {selectedDayInfo.dateStr}
                </span>
              </div>
              
              {selectedDayInfo.ratings.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-4">
                  No skills were rated on this day. Tap another date on the grid.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayInfo.ratings.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-lg bg-white/5 border-l-4 border-white/5 flex flex-col justify-between"
                      style={{ borderLeftColor: getColorHex(item.color) }}
                    >
                      <span className="text-xs text-slate-200 font-medium">
                        {item.skillName}
                      </span>
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-1.5">
                        <span>Incremental growth:</span>
                        <span className="text-white font-semibold flex items-center gap-0.5">
                          +{(item.rating * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-[10px] text-slate-500 font-mono italic leading-normal border-t border-white/5 mt-4 pt-2">
                    “असंशयं महाबाहो मनो दुर्निग्रहं चलम् । अभ्यासतः तु साध्यते ॥”
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <Calendar className="w-8 h-8 text-slate-500 mb-2 stroke-[1.5]" />
              <p className="text-xs text-slate-400">
                Tap on any calendar day to inspect past consistency metrics and logged growth rates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
