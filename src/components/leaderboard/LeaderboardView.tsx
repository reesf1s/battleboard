"use client";
import { useState } from "react";
import { LeaderboardCard } from "./LeaderboardCard";
import { GamePlanCard } from "./GamePlanCard";
import { getWeekLabel } from "@/lib/utils";

interface Group {
  _id: any;
  name: string;
  emoji?: string;
  weeklyStakes?: string;
}

interface LeaderboardViewProps {
  userId: any;
  groups: Group[];
  weekId: string;
  // Demo mode — pass pre-loaded data to skip Convex queries
  leaderboardData?: any[];
  prevScoresData?: any[];
  gameplanData?: { recommendation: string; predictedScoreNeeded: number } | null;
}

export function LeaderboardView({
  userId,
  groups,
  weekId,
  leaderboardData,
  prevScoresData,
  gameplanData,
}: LeaderboardViewProps) {
  const [activeGroupId, setActiveGroupId] = useState<any>(groups[0]._id);
  const activeGroup = groups.find((g) => g._id === activeGroupId) ?? groups[0];

  // Use pre-loaded data (demo) or Convex queries (real)
  let leaderboard = leaderboardData;
  let prevScores = prevScoresData;
  let gameplan = gameplanData;

  if (!leaderboardData) {
    // Dynamic imports — only runs when Convex provider is in tree
    const { useQuery } = require("convex/react");
    const { api } = require("../../../convex/_generated/api");
    leaderboard = useQuery(api.weeklyScores.getLeaderboard, { groupId: activeGroupId, weekId });
    prevScores = useQuery(api.weeklyScores.getPreviousWeekScores, { groupId: activeGroupId, weekId });
    gameplan = useQuery(api.weeklyGameplans.getForUser, { userId, weekId });
  }

  const topScore = leaderboard?.[0]?.totalScore ?? 0;

  return (
    <div className="flex flex-col min-h-screen px-4 pt-14 pb-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="app-display text-2xl font-bold text-[var(--text-1)] leading-tight tracking-tight">
              {activeGroup.name}
            </h1>
            <p className="text-xs text-[var(--text-3)] mt-1 font-medium tracking-wide uppercase">
              {getWeekLabel(weekId)}
            </p>
          </div>
          <a
            href="/dashboard/group-settings"
            className="p-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-3)]"
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
              <circle cx="10" cy="4" r="1.5" fill="currentColor" />
              <circle cx="10" cy="10" r="1.5" fill="currentColor" />
              <circle cx="10" cy="16" r="1.5" fill="currentColor" />
            </svg>
          </a>
        </div>

        {/* Stakes */}
        {activeGroup.weeklyStakes && (
          <div
            className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-3)" }}>
              <path d="M8 1L10 5.5L15 6.2L11.5 9.6L12.4 14.5L8 12.2L3.6 14.5L4.5 9.6L1 6.2L6 5.5L8 1Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
            </svg>
            <span className="text-sm text-[var(--text-2)] font-medium">{activeGroup.weeklyStakes}</span>
          </div>
        )}
      </div>

      {/* Group tabs */}
      {groups.length > 1 && (
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-0.5 no-scrollbar">
          {groups.map((g) => (
            <button
              key={g._id}
              onClick={() => setActiveGroupId(g._id)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={
                g._id === activeGroupId
                  ? { background: "var(--accent)", color: "#000" }
                  : { background: "var(--bg-raised)", color: "var(--text-2)", border: "1px solid var(--border)" }
              }
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {/* Leaderboard */}
      {!leaderboard ? (
        <LeaderboardSkeleton />
      ) : leaderboard.length === 0 ? (
        <EmptyLeaderboard />
      ) : (
        <div className="flex flex-col gap-2 mb-6">
          {leaderboard.map((entry: any, index: number) => {
            const prev = prevScores?.find((p: any) => p.userId === entry.userId);
            const trend = prev ? entry.totalScore - prev.totalScore : null;
            return (
              <LeaderboardCard
                key={entry._id}
                entry={entry}
                rank={index + 1}
                topScore={topScore}
                trend={trend}
                isCurrentUser={entry.userId === userId}
                weekId={weekId}
              />
            );
          })}
        </div>
      )}

      {/* Game plan */}
      {gameplan && (
        <GamePlanCard
          recommendation={(gameplan as any).recommendation}
          predictedScore={(gameplan as any).predictedScoreNeeded}
        />
      )}
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[85, 70, 55].map((w, i) => (
        <div
          key={i}
          className="p-4 rounded-2xl"
          style={{ background: "var(--bg-surface)" }}
        >
          <div className="flex items-center gap-3">
            <div className="skeleton w-8 h-8 rounded-full" />
            <div className="skeleton w-9 h-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3.5 rounded" style={{ width: `${w}%` }} />
              <div className="skeleton h-2.5 w-24 rounded" />
            </div>
            <div className="skeleton w-12 h-7 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyLeaderboard() {
  return (
    <div
      className="rounded-2xl p-10 text-center"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
    >
      <div
        className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
        style={{ background: "var(--accent-dim)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: "var(--accent)" }}>
          <path d="M12 2L15 8.5L22 9.3L17 14.1L18.2 21L12 17.7L5.8 21L7 14.1L2 9.3L9 8.5L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-[var(--text-1)] mb-1">No scores yet this week</p>
      <p className="text-xs text-[var(--text-3)]">Log a workout to claim the top spot</p>
    </div>
  );
}
