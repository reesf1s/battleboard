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

function RankBadge({ rank, color }: { rank: number; color: string }) {
  const podiumColors: Record<number, string> = {
    1: "#FFD700",
    2: "#A1A1AA",
    3: "#CD7F32",
  };
  const badgeColor = podiumColors[rank] ?? color;

  return (
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
      style={{ background: `${badgeColor}15`, color: badgeColor }}
    >
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
        "w-full text-left bg-[var(--bg-surface)] rounded-xl transition-all duration-200",
        "hover:bg-[var(--bg-raised)] active:bg-[var(--bg-overlay)]",
      )}
      style={{ padding: "12px 14px" }}
    >
      <div className="flex items-center gap-3">
        {/* Rank */}
        <RankBadge rank={rank} color={color} />

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {entry.user?.avatarUrl ? (
            <img src={entry.user.avatarUrl} alt="" className="w-9 h-9 rounded-lg object-cover" />
          ) : (
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold"
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
                style={{ background: "rgba(0,240,181,0.1)", color: "var(--accent)" }}
              >
                you
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-3)]">
            <span>{entry.workoutCount} session{entry.workoutCount !== 1 ? "s" : ""}</span>
            {entry.topWorkoutScore > 0 && (
              <>
                <span style={{ color: "var(--text-3)" }}>·</span>
                <span>Best {entry.topWorkoutScore}</span>
              </>
            )}
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-overlay)" }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${pct}%`,
                background: isCurrentUser
                  ? "linear-gradient(90deg, var(--accent), rgba(0,240,181,0.6))"
                  : `linear-gradient(90deg, ${color}, ${color}88)`,
              }}
            />
          </div>
        </div>

        {/* Score + trend */}
        <div className="flex flex-col items-end flex-shrink-0 ml-2">
          <span className="app-score text-lg font-bold leading-none" style={{ color }}>
            {entry.totalScore}
          </span>
          {trend !== null && trend !== 0 && (
            <span
              className={cn(
                "text-[10px] font-bold mt-1 flex items-center gap-0.5",
                trend > 0 ? "text-[#34D399]" : "text-[#F87171]",
              )}
            >
              {trend > 0 ? (
                <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                  <path d="M5 2L8 6H2L5 2Z" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                  <path d="M5 8L2 4H8L5 8Z" fill="currentColor" />
                </svg>
              )}
              {trend > 0 ? `+${trend}` : trend}
            </span>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && entry.topWorkoutSummary && (
        <div className="mt-3 pt-3 animate-fade-in" style={{ borderTop: "1px solid var(--bg-overlay)" }}>
          <p className="text-xs text-[var(--text-2)] leading-relaxed pl-10">
            {entry.topWorkoutSummary}
          </p>
        </div>
      )}
    </button>
  );
}
