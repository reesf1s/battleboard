"use client";
import { useState } from "react";
import { getScoreColor, cn } from "@/lib/utils";

interface LeaderboardEntry {
  _id: any;
  userId: any;
  totalScore: number;
  workoutCount: number;
  topWorkoutScore: number;
  topWorkoutSummary: string;
  user: { name: string; avatarUrl?: string } | null;
  rank: number;
}

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  rank: number;
  topScore: number;
  trend: number | null;
  isCurrentUser: boolean;
  weekId: string;
}

function RankBadge({ rank }: { rank: number }) {
  const colors: Record<number, { bg: string; border: string; text: string }> = {
    1: { bg: "rgba(255,215,0,0.1)", border: "rgba(255,215,0,0.3)", text: "#FFD700" },
    2: { bg: "rgba(161,161,170,0.08)", border: "rgba(161,161,170,0.25)", text: "#A1A1AA" },
    3: { bg: "rgba(205,127,50,0.08)", border: "rgba(205,127,50,0.25)", text: "#CD7F32" },
  };
  const c = colors[rank];
  if (c) {
    return (
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ background: c.bg, border: `1.5px solid ${c.border}`, color: c.text }}
      >
        {rank}
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0"
      style={{ background: "var(--bg-overlay)", color: "var(--text-3)" }}>
      {rank}
    </div>
  );
}

export function LeaderboardCard({ entry, rank, topScore, trend, isCurrentUser }: LeaderboardCardProps) {
  const [expanded, setExpanded] = useState(false);
  const color = getScoreColor(entry.totalScore);
  const pct = topScore > 0 ? (entry.totalScore / topScore) * 100 : 0;

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className={cn(
        "w-full text-left rounded-2xl transition-all duration-200",
        "hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)]",
        rank === 1 ? "ring-1 ring-[rgba(255,215,0,0.12)]" : "",
        isCurrentUser && rank !== 1 ? "ring-1 ring-[rgba(255,107,44,0.1)]" : "",
      )}
      style={{
        background: rank === 1 ? "rgba(255,215,0,0.03)" : "var(--bg-surface)",
        border: "1px solid var(--border)",
        padding: "14px 16px",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Rank */}
        <RankBadge rank={rank} />

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {entry.user?.avatarUrl ? (
            <img src={entry.user.avatarUrl} alt="" className="w-9 h-9 rounded-xl object-cover" />
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold"
              style={{ background: "var(--bg-overlay)", color: "var(--text-2)" }}
            >
              {entry.user?.name?.[0] ?? "?"}
            </div>
          )}
          {isCurrentUser && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
              style={{ background: "var(--accent)", border: "2px solid var(--bg-surface)" }}
            />
          )}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[15px] font-semibold text-[var(--text-1)] truncate leading-tight">
              {entry.user?.name ?? "Unknown"}
            </span>
            {isCurrentUser && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
                style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
              >
                you
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-3)]">
            <span>{entry.workoutCount} session{entry.workoutCount !== 1 ? "s" : ""}</span>
            {entry.topWorkoutScore > 0 && (
              <>
                <span style={{ color: "var(--border-strong)" }}>·</span>
                <span>Best {entry.topWorkoutScore}</span>
              </>
            )}
          </div>
          {/* Progress bar */}
          <div className="mt-2.5 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-overlay)" }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}AA)` }}
            />
          </div>
        </div>

        {/* Score + trend */}
        <div className="flex flex-col items-end flex-shrink-0 ml-2">
          <span className="app-score text-2xl font-bold leading-none" style={{ color }}>
            {entry.totalScore}
          </span>
          {trend !== null && trend !== 0 && (
            <span
              className={cn(
                "text-[10px] font-bold mt-1",
                trend > 0 ? "text-[var(--excellent)]" : "text-[#F87171]",
              )}
            >
              {trend > 0 ? `+${trend}` : trend}
            </span>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && entry.topWorkoutSummary && (
        <div className="mt-3 pt-3 animate-fade-in" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs text-[var(--text-2)] leading-relaxed pl-11">
            {entry.topWorkoutSummary}
          </p>
        </div>
      )}
    </button>
  );
}
