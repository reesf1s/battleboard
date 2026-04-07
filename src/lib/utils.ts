import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWeekId(date: Date = new Date()): string {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function getScoreTier(score: number): "legendary" | "excellent" | "solid" | "light" {
  if (score >= 90) return "legendary";
  if (score >= 75) return "excellent";
  if (score >= 55) return "solid";
  return "light";
}

export function getScoreColor(score: number): string {
  const tier = getScoreTier(score);
  const colors = {
    legendary: "#FFD60A",
    excellent: "#32D74B",
    solid: "#0A84FF",
    light: "#8E8E93",
  };
  return colors[tier];
}

export function getScoreLabel(score: number): string {
  const tier = getScoreTier(score);
  const labels = {
    legendary: "Legendary",
    excellent: "Excellent",
    solid: "Solid",
    light: "Light effort",
  };
  return labels[tier];
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function getRankEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `${rank}`;
}

export function getActivityEmoji(activityType: string): string {
  const map: Record<string, string> = {
    "Running": "🏃",
    "Cycling": "🚴",
    "Swimming": "🏊",
    "Walking": "🚶",
    "Hiking": "🥾",
    "Gym (Strength)": "🏋️",
    "Gym (Cardio)": "💪",
    "Yoga/Pilates": "🧘",
    "Boxing/MMA": "🥊",
    "HIIT/CrossFit": "⚡",
    "Team Sports": "⚽",
    "Climbing": "🧗",
    "Snowboarding/Skiing": "🏂",
    "Dance": "💃",
    "Rowing": "🚣",
    "Other": "🏅",
  };
  return map[activityType] || "🏅";
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function getWeekLabel(weekId: string): string {
  const [year, weekStr] = weekId.split("-W");
  const week = parseInt(weekStr);
  const d = new Date(parseInt(year), 0, 1 + (week - 1) * 7);
  const dayOfWeek = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() + (dayOfWeek <= 1 ? 1 - dayOfWeek : 8 - dayOfWeek));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}
