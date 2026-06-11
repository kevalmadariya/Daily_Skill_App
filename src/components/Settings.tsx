import React, { useRef, useState } from "react";
import { 
  Moon, Sun, Bell, Volume2, ShieldAlert, Download, Upload, 
  Trash2, Archive, RotateCcw, AlertTriangle, Check, Sliders
} from "lucide-react";
import { AbhyasaData, Skill, UserSettings } from "../types";

interface SettingsProps {
  settings: UserSettings;
  skills: Skill[];
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onUpdateSkills: (skills: Skill[]) => void;
  onRestoreAllData: (data: AbhyasaData) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  skills,
  onUpdateSettings,
  onUpdateSkills,
  onRestoreAllData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [backupMessage, setBackupMessage] = useState("");

  const handleToggleTheme = () => {
    const nextDark = !settings.darkMode;
    onUpdateSettings({ darkMode: nextDark });
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Export database backup JSON
  const handleExportData = () => {
    try {
      const dataToExport: AbhyasaData = { skills, settings };
      const raw = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([raw], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `abhyasa-backup-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setBackupMessage("Backup file downloaded successfully!");
      setTimeout(() => setBackupMessage(""), 4000);
    } catch (err) {
      console.error(err);
      setBackupMessage("Failed to generate data backup.");
    }
  };

  // Import and merge safety check
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawText = event.target?.result as string;
        const parsed = JSON.parse(rawText) as AbhyasaData;

        // Validation safeguards
        if (!parsed.skills || !Array.isArray(parsed.skills)) {
          throw new Error("Invalid skills format");
        }
        if (!parsed.settings) {
          throw new Error("Missing parameters");
        }

        onRestoreAllData(parsed);
        setImportStatus("success");
        setTimeout(() => setImportStatus("idle"), 4000);
      } catch (err) {
        console.error("Failed to parse backup JSON file:", err);
        setImportStatus("error");
        setTimeout(() => setImportStatus("idle"), 4000);
      }
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Notifications API Check
  const handleRequestNotifyPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support local background notification alerts.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification("Did you grow today?", {
        body: "🕉️ “कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। ” Recall today's practices on Abhyasa.",
        icon: "/favicon.ico"
      });
    }
  };

  // Skills archive/purge handlers
  const handleToggleArchiveSkill = (skillId: string) => {
    const updated = skills.map(skill => {
      if (skill.id === skillId) {
        return { ...skill, isArchived: !skill.isArchived };
      }
      return skill;
    });
    onUpdateSkills(updated);
  };

  const handleDeleteSkill = (skillId: string) => {
    if (confirm("Are you sure you want to completely erase this skill and all of its historical ratings? This cannot be undone.")) {
      const filtered = skills.filter(skill => skill.id !== skillId);
      onUpdateSkills(filtered);
    }
  };

  return (
    <div id="settings-view-panel" className="space-y-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Mode Preferences */}
        <div className="rounded-2xl border border-white/10 dark:border-white/5 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sliders className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
              Sadhana Preferences
            </h3>
          </div>

          <div className="space-y-4">
            {/* Bright/Dark toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/15 border border-white/5">
              <div className="flex items-center gap-2.5">
                {settings.darkMode ? (
                  <Moon className="w-4 h-4 text-purple-400" />
                ) : (
                  <Sun className="w-4 h-4 text-yellow-500" />
                )}
                <div>
                  <span className="text-xs font-medium text-slate-200 block">
                    {settings.darkMode ? "Meditative Dark Mode" : "Soft Bright Mode"}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Sparsely glows translucent glassmorphism grids.
                  </span>
                </div>
              </div>
              <button
                id="toggle-theme-btn"
                onClick={handleToggleTheme}
                className="text-xs px-3 py-1.5 rounded-md font-medium text-white shadow bg-white/5 hover:bg-white/10 border border-white/10"
              >
                Toggle Mode
              </button>
            </div>

            {/* Strict Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/15 border border-white/5">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <div>
                  <span className="text-xs font-medium text-slate-200 block">
                    Sadhana Strict Mode
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Lock today's daily ratings until at least one task is done.
                  </span>
                </div>
              </div>
              <button
                id="toggle-strict-btn"
                onClick={() => onUpdateSettings({ strictMode: !settings.strictMode })}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                  settings.strictMode
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10"
                }`}
              >
                {settings.strictMode ? "Strict Mode ON" : "Strict Mode OFF"}
              </button>
            </div>

            {/* Gentle Sound chime toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/15 border border-white/5">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-xs font-medium text-slate-200 block">
                    Ambient Bowl Resonance
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Play a singing bowl bell sound when daily reading loads.
                  </span>
                </div>
              </div>
              <button
                id="toggle-sound-btn"
                onClick={() => onUpdateSettings({ notificationSound: !settings.notificationSound })}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                  settings.notificationSound
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10"
                }`}
              >
                {settings.notificationSound ? "Chimes ON" : "Chimes OFF"}
              </button>
            </div>
          </div>
        </div>

        {/* Local Backup & Portability */}
        <div className="rounded-2xl border border-white/10 dark:border-white/5 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <Download className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
              Data Backup & Privacy
            </h3>
          </div>

          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
            All progress statistics live privately inside your local cache. Back up your parameters to a JSON database file before wiping caches.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              id="export-data-btn"
              onClick={handleExportData}
              className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-200 hover:bg-white/10 flex flex-col items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Export Ledger</span>
            </button>

            <button
              id="import-data-btn"
              onClick={triggerFileInput}
              className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-200 hover:bg-white/10 flex flex-col items-center justify-center gap-2 transition"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Import Ledger</span>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />

          {/* Feedback messages */}
          {backupMessage && (
            <div className="p-2 border border-blue-500/10 bg-blue-500/5 text-blue-400 text-center rounded-lg text-[10px] sm:text-xs">
              {backupMessage}
            </div>
          )}

          {importStatus === "success" && (
            <div className="p-2 border border-emerald-500/10 bg-emerald-500/5 text-emerald-400 text-center rounded-lg text-xs flex items-center justify-center gap-1">
              <Check className="w-4 h-4" /> Import successful! Screen refreshed.
            </div>
          )}

          {importStatus === "error" && (
            <div className="p-2 border border-rose-500/10 bg-rose-500/5 text-rose-400 text-center rounded-lg text-xs flex items-center justify-center gap-1">
              <AlertTriangle className="w-4 h-4" /> Import failed. Ensure valid JSON backup format.
            </div>
          )}

          {/* Local reminder trigger */}
          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-slate-200">Browser Nudges</span>
                  <span className="text-[9px] text-slate-500">Schedule localized daily triggers</span>
                </div>
              </div>
              <button
                id="request-permission-btn"
                onClick={handleRequestNotifyPermission}
                className="text-[10px] text-amber-500 underline uppercase tracking-tight hover:text-amber-400 font-mono"
              >
                Grant Permission
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Maintenance Table */}
      <div className="rounded-2xl border border-white/10 dark:border-white/5 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
            <Archive className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
            Disciplines Management Index
          </h3>
        </div>

        {skills.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 italic">
            No registered disciplines found. Add skills to initiate consistent Abhyasa.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 font-mono">
              <thead>
                <tr className="border-b border-white/5 text-slate-500">
                  <th className="py-2.5 px-3">Discipline Name</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Historic Datasets</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {skills.map(skill => {
                  const ratingCount = Object.keys(skill.ratings).length;
                  return (
                    <tr key={skill.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                      <td className="py-3 px-3 font-semibold text-slate-200">
                        {skill.name} {skill.isPinned && "📌"}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] ${
                          skill.isArchived 
                            ? "bg-yellow-500/10 text-yellow-400-accent text-yellow-500 border border-yellow-500/15" 
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                        }`}>
                          {skill.isArchived ? "Archived" : "Active"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {ratingCount} days logged
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleArchiveSkill(skill.id)}
                            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                            title={skill.isArchived ? "Unarchive skill" : "Archive skill"}
                          >
                            {skill.isArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteSkill(skill.id)}
                            className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300"
                            title="Hard delete skill"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
