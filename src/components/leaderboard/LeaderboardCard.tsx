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
  user: {
    name: string;
    avatarUrl?: string;
  } | null;
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

export function LeaderboardCard({
  entry,
  rank,
  topScore,
  trend,
  isCurrentUser,
}: LeaderboardCardProps) {
  const [expanded, setExpanded] = useState(false);
  const color = getScoreColor(entry.topWorkoutScore);
  const tier = getScoreTier(entry.topWorkoutScore);
  const progressPct = topScore > 0 ? (entry.totalScore / topScore) * 100 : 0;
  const isFirst = rank === 1;

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className={cn(
        "glass-card p-4 w-full text-left transition-all duration-200 active:scale-[0.99]",
        isFirst && "border-[var(--rank-1)]/40",
        isCurrentUser && !isFirst && "border-[var(--accent-primary)]/20"
      )}
      style={
        isFirst
          ? { borderColor: "rgba(255,214,10,0.3)", boxShadow: "0 0 24px rgba(255,214,10,0.12), var(--shadow-glass)" }
          : {}
      }
    >
      <div className="flex items-center gap-3">
        {/* Rank */}
        <div className="text-xl font-bold w-8 text-center flex-shrink-0">
          {rank <= 3 ? getRankEmoji(rank) : <span className="text-[var(--text-tertiary)] text-base">{rank}</span>}
        </div>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {entry.user?.avatarUrl ? (
            <img
              src={entry.user.avatarUrl}
              alt={entry.user.name}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "var(--bg-elevated)" }}
            >
              {entry.user?.name?.[0] || "?"}
            </div>
          )}
          {isCurrentUser && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
              style={{
                background: "var(--accent-primary)",
                borderColor: "var(--bg-primary)",
              }}
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[var(--text-primary)] truncate text-sm">
              {entry.user?.name || "Unknown"}
              {isCurrentUser && (
                <span className="ml-1 text-xs text-[var(--accent-primary)]">(you)</span>
              )}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              {trend !== null && (
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend > 0
                      ? "text-[var(--accent-primary)]"
                      : trend < 0
                      ? "text-[#FF453A]"
                      : "text-[var(--text-tertiary)]"
                  )}
                >
                  {trend > 0 ? `↑ +${trend}` : trend < 0 ? `↓ ${trend}` : "→"}
                </span>
              )}
              <span
                className="text-xl font-black"
                style={{ color }}
              >
                {entry.totalScore}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-[var(--text-tertiary)]">
              {entry.workoutCount} workout{entry.workoutCount !== 1 ? "s" : ""}
            </span>
            {entry.topWorkoutSummary && (
              <>
                <span className="text-[var(--text-tertiary)] text-xs">·</span>
                <span className="text-xs text-[var(--text-tertiary)] truncate">
                  Top: {entry.topWorkoutScore}pts
                </span>
              </>
            )}
          </div>

          {/* Progress bar */}
          <div
            className="mt-2 h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPct}%`,
                background: `linear-gradient(90deg, ${color}80, ${color})`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Expanded top workout summary */}
      {expanded && entry.topWorkoutSummary && (
        <div
          className="mt-3 pt-3 border-t animate-fade-in"
          style={{ borderColor: "var(--glass-border)" }}
        >
          <p className="text-xs text-[var(--text-secondary)]">
            🏆 Best this week: {entry.topWorkoutSummary}
          </p>
        </div>
      )}
    </button>
  );
}
