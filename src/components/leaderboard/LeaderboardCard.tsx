"use client";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { getRankEmoji, getScoreColor, getScoreTier, cn } from "@/lib/utils";

interface LeaderboardEntry {
  _id: Id<"weeklyScores">;
  userId: Id<"users">;
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

export function LeaderboardCard({ entry, rank, topScore, trend, isCurrentUser }: LeaderboardCardProps) {
  const [expanded, setExpanded] = useState(false);
  const color    = getScoreColor(entry.totalScore);
  const pct      = topScore > 0 ? (entry.totalScore / topScore) * 100 : 0;
  const isFirst  = rank === 1;

  const rankDisplay = rank <= 3
    ? ["🥇", "🥈", "🥉"][rank - 1]
    : <span className="text-xs font-semibold text-[var(--text-3)]">{rank}</span>;

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className={cn(
        "w-full text-left p-4 rounded-xl border transition-all duration-150",
        "hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)]",
        isFirst
          ? "border-[var(--gold)]/20 bg-[var(--bg-raised)]"
          : isCurrentUser
          ? "border-[var(--accent)]/15 bg-[var(--bg-raised)]"
          : "border-[var(--border)] bg-[var(--bg-surface)]"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Rank */}
        <div className="w-7 text-center flex-shrink-0 text-lg leading-none">
          {rankDisplay}
        </div>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {entry.user?.avatarUrl ? (
            <img src={entry.user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ background: "var(--bg-overlay)", color: "var(--text-2)" }}
            >
              {entry.user?.name?.[0] ?? "?"}
            </div>
          )}
          {isCurrentUser && (
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-surface)]"
              style={{ background: "var(--accent)" }} />
          )}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-semibold text-[var(--text-1)] truncate leading-tight">
              {entry.user?.name ?? "—"}
            </span>
            {isCurrentUser && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                you
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-3)]">
              {entry.workoutCount} session{entry.workoutCount !== 1 ? "s" : ""}
            </span>
            {entry.topWorkoutScore > 0 && (
              <>
                <span className="text-[var(--border-strong)] text-xs">·</span>
                <span className="text-xs text-[var(--text-3)]">
                  Best {entry.topWorkoutScore}pts
                </span>
              </>
            )}
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-0.5 rounded-full overflow-hidden" style={{ background: "var(--bg-overlay)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: color }}
            />
          </div>
        </div>

        {/* Score + trend */}
        <div className="flex flex-col items-end flex-shrink-0 ml-1">
          <span className="text-lg font-black leading-tight" style={{ color }}>
            {entry.totalScore}
          </span>
          {trend !== null && trend !== 0 && (
            <span className={cn(
              "text-[10px] font-semibold leading-tight",
              trend > 0 ? "text-[var(--excellent)]" : "text-[#F87171]"
            )}>
              {trend > 0 ? `+${trend}` : trend}
            </span>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && entry.topWorkoutSummary && (
        <div className="mt-3 pt-3 animate-fade-in" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs text-[var(--text-2)] leading-relaxed">
            🏆 {entry.topWorkoutSummary}
          </p>
        </div>
      )}
    </button>
  );
}
