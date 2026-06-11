import { AbhyasaData, Skill } from "../types";

export function getLocalDateString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T12:00:00"); // T12:00:00 avoids daylight saving shifts
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

export function calculateSkillStreak(ratings: Record<string, number>, todayStr: string): number {
  let streak = 0;
  let currentCheck = todayStr;
  const yesterdayStr = addDays(todayStr, -1);

  if (ratings[todayStr] !== undefined && ratings[todayStr] > 0) {
    streak = 1;
    currentCheck = yesterdayStr;
  } else if (ratings[yesterdayStr] !== undefined && ratings[yesterdayStr] > 0) {
    streak = 1;
    currentCheck = addDays(yesterdayStr, -1);
  } else {
    return 0;
  }

  while (true) {
    if (ratings[currentCheck] !== undefined && ratings[currentCheck] > 0) {
      streak++;
      currentCheck = addDays(currentCheck, -1);
    } else {
      break;
    }
  }
  return streak;
}

export function calculateGlobalStreak(skills: { ratings: Record<string, number> }[], todayStr: string): number {
  const allRatedDates = new Set<string>();
  skills.forEach(skill => {
    Object.keys(skill.ratings).forEach(date => {
      if (skill.ratings[date] > 0) {
        allRatedDates.add(date);
      }
    });
  });

  let streak = 0;
  let currentCheck = todayStr;
  const yesterdayStr = addDays(todayStr, -1);

  if (allRatedDates.has(todayStr)) {
    streak = 1;
    currentCheck = yesterdayStr;
  } else if (allRatedDates.has(yesterdayStr)) {
    streak = 1;
    currentCheck = addDays(yesterdayStr, -1);
  } else {
    return 0;
  }

  while (true) {
    if (allRatedDates.has(currentCheck)) {
      streak++;
      currentCheck = addDays(currentCheck, -1);
    } else {
      break;
    }
  }
  return streak;
}

// Calculate consistency score: percentage of days since skill creation where status is rated (>0)
export function calculateConsistencyScore(skill: Skill, todayStr: string): number {
  if (!skill.createdAt) return 0;
  const createdDateStr = skill.createdAt.split('T')[0];
  
  let totalDays = 0;
  let ratedDays = 0;
  let current = createdDateStr;

  while (current <= todayStr) {
    totalDays++;
    if (skill.ratings[current] !== undefined && skill.ratings[current] > 0) {
      ratedDays++;
    }
    current = addDays(current, 1);
  }

  if (totalDays === 0) return 0;
  return Math.round((ratedDays / totalDays) * 100);
}

// Sound Synthesizer: Meditative Bowl Chime
export function playBowlChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // frequencies corresponding to a classic singing bowl chime
    const freqs = [220.00, 330.00, 495.00, 660.00]; // Harmonic ratios
    const gains = [0.4, 0.3, 0.2, 0.1];
    
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.25, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);
    masterGain.connect(ctx.destination);
    
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      // detune for a thick resonant warmth (shimmering speed wobble)
      osc.detune.setValueAtTime((idx - 1.5) * 5, now);
      
      gainNode.gain.setValueAtTime(gains[idx], now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);
      
      osc.connect(gainNode);
      gainNode.connect(masterGain);
      
      osc.start(now);
      osc.stop(now + 3.6);
    });
  } catch (err) {
    console.warn("Audio chime prevented:", err);
  }
}

// Default storage state builder
const INITIAL_DATA: AbhyasaData = {
  skills: [
    {
      id: "skill-ai",
      name: "AI & Machine Learning",
      icon: "Brain",
      color: "gold",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      isPinned: true,
      isArchived: false,
      tasks: [
        { id: "task-ai-1", text: "Read 1 paper or study a neural topology", completed: true, createdAt: new Date().toISOString() },
        { id: "task-ai-2", text: "Write or edit 50 lines of code in Python/TS", completed: false, createdAt: new Date().toISOString() }
      ],
      ratings: {
        [addDays(getLocalDateString(), -2)]: 0.40,
        [addDays(getLocalDateString(), -1)]: 0.65,
      }
    },
    {
      id: "skill-design",
      name: "UI / UX Design",
      icon: "Brush",
      color: "mint",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isPinned: false,
      isArchived: false,
      tasks: [
        { id: "task-ds-1", text: "Practice component layout on a digital canvas", completed: true, createdAt: new Date().toISOString() },
        { id: "task-ds-2", text: "Verify typography hierarchy & contrast rules", completed: true, createdAt: new Date().toISOString() }
      ],
      ratings: {
        [addDays(getLocalDateString(), -1)]: 0.80,
      }
    }
  ],
  settings: {
    darkMode: true,
    strictMode: true,
    notificationTime: "23:00",
    notificationSound: true,
    bookmarkedShlokas: [1]
  }
};

const STORAGE_KEY = "@abhyasa:growth-tracker-data";

export function loadAbhyasaData(): AbhyasaData {
  if (typeof window === "undefined") return INITIAL_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Save initial
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    const parsed = JSON.parse(raw) as AbhyasaData;
    
    // Safety check nested schemas are robust
    if (!parsed.skills || !Array.isArray(parsed.skills)) {
      parsed.skills = INITIAL_DATA.skills;
    }
    if (!parsed.settings) {
      parsed.settings = INITIAL_DATA.settings;
    }
    return parsed;
  } catch (err) {
    console.error("Failed to load Abhyasa persistent storage:", err);
    return INITIAL_DATA;
  }
}

export function saveAbhyasaData(data: AbhyasaData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save Abhyasa persistent storage:", err);
  }
}
