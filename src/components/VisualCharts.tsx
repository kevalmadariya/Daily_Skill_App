import React, { useState } from "react";
import { LineChart, BarChart, ArrowUpRight, Download, Share2, Clipboard, Check, Calendar } from "lucide-react";
import { Skill } from "../types";
import { getLocalDateString, addDays } from "../utils/storage";

interface VisualChartsProps {
  skills: Skill[];
  selectedSkillId: string;
}

export const VisualCharts: React.FC<VisualChartsProps> = ({ skills, selectedSkillId }) => {
  const [copied, setCopied] = useState(false);
  const selectedSkill = skills.find((s) => s.id === selectedSkillId) || skills[0];

  // Helper: Get list of past 14 days
  const getPast14Days = (): string[] => {
    const dates: string[] = [];
    const today = getLocalDateString();
    for (let i = 13; i >= 0; i--) {
      dates.push(addDays(today, -i));
    }
    return dates;
  };

  const chartDates = getPast14Days();

  // Helper: Retrieve rating for skill at target date or 0
  const getRatingForDate = (skill: Skill, dateStr: string): number => {
    return skill?.ratings[dateStr] || 0;
  };

  // Helper: Calculate 7-day moving average
  const calculateMovingAverage = (skill: Skill, dateStr: string): number => {
    let sum = 0;
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = addDays(dateStr, -i);
      const rating = skill?.ratings[d] || 0;
      sum += rating;
      count++;
    }
    return count > 0 ? sum / count : 0;
  };

  const trendData = selectedSkill
    ? chartDates.map((date) => {
        return {
          date,
          label: date.slice(5), // 'MM-DD'
          rating: getRatingForDate(selectedSkill, date),
          movingAvg: calculateMovingAverage(selectedSkill, date),
        };
      })
    : [];

  // 1. Line Chart Math
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;
  const width = 600;
  const height = 280;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // X & Y Scale functions
  const getX = (index: number) => {
    return paddingLeft + (index / (chartDates.length - 1)) * chartWidth;
  };

  const getY = (value: number) => {
    // value is between 0.00 and 1.00
    return paddingTop + chartHeight - value * chartHeight;
  };

  // Generate Path coordinates
  const dailyPath = trendData
    .map((point, index) => `${index === 0 ? "M" : "L"} ${getX(index)} ${getY(point.rating)}`)
    .join(" ");

  const movingAvgPath = trendData
    .map((point, index) => `${index === 0 ? "M" : "L"} ${getX(index)} ${getY(point.movingAvg)}`)
    .join(" ");

  // 2. Bar Chart Math: Cumulative Growth Points (accumulated sum of ratings)
  const activeSkills = skills.filter((s) => !s.isArchived);
  const barChartSkills = activeSkills.map((skill) => {
    const totalPoints = Object.values(skill.ratings).reduce((acc: number, curr: number) => acc + curr, 0);
    return {
      name: skill.name,
      points: totalPoints,
      color: skill.color,
    };
  });

  const maxPoints = Math.max(...barChartSkills.map((s) => s.points), 1);

  // SVG color helpers
  const getColorHex = (color: string) => {
    switch (color) {
      case "gold":
        return "#f4b400";
      case "mint":
        return "#00c9a7";
      case "purple":
        return "#a855f7";
      case "rose":
        return "#f43f5e";
      case "cyan":
        return "#06b6d4";
      default:
        return "#3d5afe";
    }
  };

  // Export as Copyable Text Report
  const handleCopyTextReport = () => {
    if (!selectedSkill) return;
    const activeRatings = Object.entries(selectedSkill.ratings)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 10); // last 10 days sorted

    let text = `🕉️ *Abhyasa Skill Growth Report* 🕉️\n`;
    text += `Skill Focus: ${selectedSkill.name}\n`;
    text += `Consistency Rating (Last 10 updates):\n`;
    if (activeRatings.length === 0) {
      text += `- No practices logged yet.\n`;
    } else {
      activeRatings.forEach(([date, val]) => {
        const numericVal = typeof val === "number" ? val : Number(val);
        text += `- ${date}: +${(numericVal * 100).toFixed(0)}% growth\n`;
      });
    }
    text += `\n“कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।”\n`;
    text += `Driven by consistent, mindful daily effort offline.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export SVG to PNG via Canvas
  const handleExportPNG = (svgId: string, filename: string) => {
    try {
      const svgElement = document.getElementById(svgId);
      if (!svgElement) return;

      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const blobURL = window.URL.createObjectURL(svgBlob);
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width * 2; // Scale for crisp high-dpi render
        canvas.height = height * 2;
        const context = canvas.getContext("2d");
        if (context) {
          context.scale(2, 2);
          // Fill background based on theme (white or dark)
          const isDark = document.documentElement.classList.contains("dark");
          context.fillStyle = isDark ? "#0d0f14" : "#ffffff";
          context.fillRect(0, 0, width, height);
          context.drawImage(image, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const downloadLink = document.createElement("a");
              downloadLink.href = window.URL.createObjectURL(blob);
              downloadLink.download = filename;
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
            }
          }, "image/png");
        }
      };
      image.src = blobURL;
    } catch (err) {
      console.error("Failed to export chart image:", err);
    }
  };

  return (
    <div id="analytics-charts-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* 1. Skill Trend Line Chart */}
      <div className="rounded-[32px] border border-white/10 dark:border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-2xl p-6 sm:p-8 flex flex-col justify-between transition-all hover:shadow-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 blur-2xl pointer-events-none"></div>
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                <LineChart className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-none font-sans">
                  Growth Trend: {selectedSkill?.name || "Abhyasa"}
                </h3>
                <p className="text-[11px] text-[#a0a5b5] mt-1.5 font-mono">
                  14-Day Progress & 7-Day Moving Avg
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="copy-text-report-btn"
                onClick={handleCopyTextReport}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Copy growth report to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
              </button>
              <button
                id="export-line-png-btn"
                onClick={() => handleExportPNG("skill-line-chart-svg", `${selectedSkill?.name || "skill"}-trend.png`)}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Download chart as PNG image"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG Line Chart Viewport */}
          <div className="relative w-full aspect-[2/1] sm:aspect-auto sm:h-56 mt-2 overflow-x-auto">
            {selectedSkill ? (
              <svg
                id="skill-line-chart-svg"
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full min-w-[500px]"
              >
                {/* Horizontal reference lines & Y labels */}
                {[0.0, 0.25, 0.5, 0.75, 1.0].map((val) => (
                  <g key={val}>
                    <line
                      x1={paddingLeft}
                      y1={getY(val)}
                      x2={width - paddingRight}
                      y2={getY(val)}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={getY(val) + 4}
                      fill="rgba(150,150,150,0.6)"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {`${Math.round(val * 100)}%`}
                    </text>
                  </g>
                ))}

                {/* X labels */}
                {trendData.map((point, index) => (
                  <text
                    key={index}
                    x={getX(index)}
                    y={height - paddingBottom + 16}
                    fill="rgba(150,150,150,0.6)"
                    fontSize="8"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {point.label}
                  </text>
                ))}

                {/* Gradient Fill under the trend curve */}
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={getColorHex(selectedSkill?.color)} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={getColorHex(selectedSkill?.color)} stopOpacity="0.00" />
                  </linearGradient>
                </defs>
                {trendData.length > 0 && (
                  <path
                    d={`${dailyPath} L ${getX(chartDates.length - 1)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`}
                    fill="url(#areaGradient)"
                  />
                )}

                {/* Daily ratings line */}
                <path
                  d={dailyPath}
                  fill="none"
                  stroke={getColorHex(selectedSkill?.color)}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* 7-Day Moving Avg dashed line */}
                <path
                  d={movingAvgPath}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  strokeOpacity="0.8"
                />

                {/* Data Points Dots */}
                {trendData.map((point, index) => (
                  <g key={index}>
                    {point.rating > 0 && (
                      <circle
                        cx={getX(index)}
                        cy={getY(point.rating)}
                        r="3.5"
                        fill={getColorHex(selectedSkill?.color)}
                        stroke="#ffffff"
                        strokeWidth="1"
                        className="transition-all cursor-crosshair hover:r-5"
                      />
                    )}
                  </g>
                ))}
              </svg>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                Add ratings to view trend analytics.
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        {selectedSkill && (
          <div className="flex items-center justify-center gap-6 mt-4 text-[10px] font-mono border-t border-white/5 pt-3">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getColorHex(selectedSkill.color) }} />
              Daily Rating
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-0.5 border-t border-dashed border-red-500" />
              7-Day Moving Avg
            </span>
          </div>
        )}
      </div>

      {/* 2. Bar Chart of Total Growth Points (accumulated sum of ratings) */}
      <div className="rounded-[32px] border border-white/10 dark:border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-2xl p-6 sm:p-8 flex flex-col justify-between transition-all hover:shadow-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full -mr-12 -mt-12 blur-2xl pointer-events-none"></div>
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/25">
                <BarChart className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-none font-sans">
                  Accumulated Growth Points
                </h3>
                <p className="text-[11px] text-[#a0a5b5] mt-1.5 font-mono">
                  Cumulative sum of track ratings per skill
                </p>
              </div>
            </div>

            <button
              id="export-points-png-btn"
              onClick={() => handleExportPNG("skills-points-chart-svg", "accumulated-growth-points.png")}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Download points chart as PNG"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SVG Bar Chart */}
          <div className="relative w-full aspect-[2/1] sm:aspect-auto sm:h-56 mt-2 overflow-x-auto">
            {barChartSkills.length > 0 ? (
              <svg
                id="skills-points-chart-svg"
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full min-w-[500px]"
              >
                {/* Horizontal reference lines & Y labels */}
                {[0, 0.25, 0.5, 0.75, 1.0].map((pct) => {
                  const val = pct * maxPoints;
                  return (
                    <g key={pct}>
                      <line
                        x1={paddingLeft}
                        y1={getY(pct)}
                        x2={width - paddingRight}
                        y2={getY(pct)}
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingLeft - 8}
                        y={getY(pct) + 4}
                        fill="rgba(150,150,150,0.6)"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        {val.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Grid bars */}
                {barChartSkills.map((skill, index) => {
                  const barCount = barChartSkills.length;
                  const itemWidth = chartWidth / barCount;
                  const barWidth = Math.min(itemWidth * 0.4, 45);
                  const x = paddingLeft + (index + 0.5) * itemWidth - barWidth / 2;
                  
                  const valueRatio = skill.points / maxPoints;
                  const barHeight = valueRatio * chartHeight;
                  const y = paddingTop + chartHeight - barHeight;

                  return (
                    <g key={skill.name}>
                      {/* Pillars with rounded tops */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={Math.max(barHeight, 2)}
                        rx="4"
                        fill={getColorHex(skill.color)}
                        opacity="0.85"
                        className="transition-all hover:opacity-100 cursor-help"
                      />
                      {/* Exact value written on top of bar */}
                      <text
                        x={x + barWidth / 2}
                        y={y - 6}
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="semibold"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {skill.points.toFixed(2)}
                      </text>
                      {/* Name below bar */}
                      <text
                        x={x + barWidth / 2}
                        y={height - paddingBottom + 16}
                        fill="rgba(150,150,150,0.8)"
                        fontSize="8"
                        textAnchor="middle"
                        className="truncate max-w-[80px]"
                      >
                        {skill.name.length > 10 ? `${skill.name.slice(0, 9)}…` : skill.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                No active skills to map.
              </div>
            )}
          </div>
        </div>

        {/* Bottom philosophy message */}
        <div className="text-center font-mono text-[9px] text-slate-500 border-t border-white/5 pt-3 mt-4 flex items-center justify-center gap-1">
          <ArrowUpRight className="w-3 h-3 text-teal-400" />
          Accumulated Growth Points show total cumulative progress over lifetime
        </div>
      </div>
    </div>
  );
};
