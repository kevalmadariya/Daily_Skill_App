export interface DailyTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  icon: string; // Lucide icon name, e.g. "Brain", "TrendingUp", "Brush"
  color: string; // Accent color name like "gold", "mint", "purple", "rose", "cyan"
  createdAt: string;
  isPinned: boolean;
  isArchived: boolean;
  tasks: DailyTask[];
  ratings: Record<string, number>; // key: 'YYYY-MM-DD', value: progress 0.00 to 1.00
}

export interface UserSettings {
  darkMode: boolean;
  strictMode: boolean; // if true, rating slider is disabled until at least one task is done
  notificationTime: string; // '23:00'
  notificationSound: boolean; // subtle chime sound
  bookmarkedShlokas: number[]; // indices or ids of bhagavad gita verses bookmarked
}

export interface AbhyasaData {
  skills: Skill[];
  settings: UserSettings;
}
