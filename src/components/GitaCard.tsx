import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bookmark, Sparkles, BookOpen, Volume2, ChevronRight, ChevronLeft, Calendar } from "lucide-react";
import { SHLOKAS, Shloka } from "../data/shlokas";
import { playBowlChime } from "../utils/storage";

interface GitaCardProps {
  bookmarkedIds: number[];
  onToggleBookmark: (id: number) => void;
  soundEnabled: boolean;
}

export const GitaCard: React.FC<GitaCardProps> = ({
  bookmarkedIds,
  onToggleBookmark,
  soundEnabled
}) => {
  // Select daily verse based on today's calendar date
  const getDailyVerseIndex = () => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return dayOfYear % SHLOKAS.length;
  };

  const dailyIndex = getDailyVerseIndex();
  const [currentIndex, setCurrentIndex] = useState(dailyIndex);
  const [showReflection, setShowReflection] = useState(false);
  const [hasChimed, setHasChimed] = useState(false);

  const currentShloka = SHLOKAS[currentIndex];
  const isBookmarked = bookmarkedIds.includes(currentShloka.id);

  // play sound when daily verse renders initially
  useEffect(() => {
    if (soundEnabled && !hasChimed) {
      playBowlChime();
      setHasChimed(true);
    }
  }, [soundEnabled, hasChimed]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReflection(false);
    setCurrentIndex((prev) => (prev + 1) % SHLOKAS.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReflection(false);
    setCurrentIndex((prev) => (prev - 1 + SHLOKAS.length) % SHLOKAS.length);
  };

  const handleResetToToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReflection(false);
    setCurrentIndex(dailyIndex);
    if (soundEnabled) {
      playBowlChime();
    }
  };

  const handleChimeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playBowlChime();
  };

  return (
    <div id="gita-shloka-section" className="w-full">
      <div 
        id="gita-card-container"
        className="relative overflow-hidden rounded-[32px] border border-white/10 dark:border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-2xl p-8 sm:p-10 transition-all hover:shadow-2xl hover:shadow-[#f4b400]/5 cursor-pointer shadow-xl"
        onClick={() => setShowReflection(!showReflection)}
      >
        {/* Absolute top-right warm glow circle */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#f4b400]/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>

        {/* Subtle Meditative Particle Effect (Background animation) */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-[#f4b400]/20 blur-sm animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-3.5 h-3.5 rounded-full bg-[#00c9a7]/10 blur-md animate-ping" style={{ animationDuration: '6s' }} />
          <div className="absolute top-2/3 right-12 w-2 h-2 rounded-full bg-amber-500/15 blur-sm animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>

        {/* Card Header controls */}
        <div className="flex items-center justify-between gap-4 mb-6 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#f4b400]/20 text-[#f4b400] text-[9px] font-black uppercase rounded-full tracking-[0.15em] flex items-center gap-1.5 border border-[#f4b400]/20">
              <Sparkles id="sparkle-icon" className="w-3 h-3 animate-spin-slow" />
              Daily Contemplation
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-400 font-mono tracking-wider">
              Ch. {currentShloka.chapter}, Verse {currentShloka.verse}
            </span>
          </div>

          <div className="flex items-center gap-1 border border-white/10 bg-black/15 rounded-full p-1 backdrop-blur-md">
            <button
              id="gita-bookmark-btn"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(currentShloka.id);
              }}
              className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors rounded-full hover:bg-white/5"
              title={isBookmarked ? "Remove bookmark" : "Bookmark this shloka"}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
            </button>
            <button
              id="gita-chime-playback-btn"
              onClick={handleChimeClick}
              className="p-1.5 text-slate-400 hover:text-[#00c9a7] transition-colors rounded-full hover:bg-white/5"
              title="Sound the meditative bell chime"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Shloka Grid Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentShloka.id + (showReflection ? "-reflect" : "-sanskrit")}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col min-h-[140px] justify-center"
          >
            {!showReflection ? (
              // Face-side: Sanskrit Lettering
              <div className="text-center py-2">
                <blockquote className="mb-4">
                  <p id="sanskrit-letters" className="text-2xl sm:text-3xl leading-relaxed text-white/95 italic whitespace-pre-line tracking-wide font-serif" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                    “{currentShloka.sanskrit}”
                  </p>
                </blockquote>
                <p id="romanized-text" className="mt-4 text-xs sm:text-sm text-[#a0a5b5] italic leading-relaxed max-w-xl mx-auto px-4 font-mono opacity-80">
                  {currentShloka.romanized}
                </p>
                <div className="mt-6 inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-[#f4b400]/90 border border-[#f4b400]/25 rounded-full px-4 py-1 bg-[#f4b400]/5 hover:bg-[#f4b400]/10 transition-colors">
                  <BookOpen className="w-3.5 h-3.5" /> Tap to reveal translation & reflection
                </div>
              </div>
            ) : (
              // Reverse-side: Explanation
              <div className="w-full flex flex-col items-center py-2">
                <div className="text-center w-full max-w-3xl">
                  <p id="english-meaning" className="text-base sm:text-lg text-white/90 font-serif leading-relaxed mb-4 italic" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                    “{currentShloka.english}”
                  </p>
                  <div className="w-16 h-px bg-white/10 mx-auto my-4" />
                  <p id="spiritual-reflection" className="text-xs sm:text-sm text-[#a0a5b5] leading-relaxed font-sans mt-2 border-l-2 border-[#f4b400]/40 pl-4 text-left italic">
                    <strong className="text-[#f4b400] not-italic font-bold block mb-1 uppercase tracking-wider text-[10px]">Mindful Reflection (Sādhanā)</strong>
                    {currentShloka.reflection}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    Tap to view original Sanskrit shloka
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer Browsing Controls */}
        <div className="flex items-center justify-between border-t border-white/10 mt-6 pt-4 pointer-events-auto">
          <button
            id="shloka-prev-btn"
            onClick={handlePrev}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors py-1.5 px-3 rounded-full hover:bg-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentIndex !== dailyIndex ? (
            <button
              id="shloka-today-reset"
              onClick={handleResetToToday}
              className="flex items-center gap-1.5 text-xs text-[#f4b400] font-mono py-1.5 px-3.5 rounded-full bg-[#f4b400]/10 hover:bg-[#f4b400]/15 border border-[#f4b400]/10 transition-all scale-95"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Today's Verse</span>
            </button>
          ) : (
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest self-center">
              Today's Meditative Verse
            </span>
          )}

          <button
            id="shloka-next-btn"
            onClick={handleNext}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors py-1.5 px-3 rounded-full hover:bg-white/5"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
