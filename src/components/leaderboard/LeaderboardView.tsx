"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { LeaderboardCard } from "./LeaderboardCard";
import { GamePlanCard } from "./GamePlanCard";
import { getWeekLabel } from "@/lib/utils";

interface Group {
  _id: Id<"groups">;
  name: string;
  emoji?: string;
  weeklyStakes?: string;
}

export function LeaderboardView({ userId, groups, weekId }: {
  userId: Id<"users">;
  groups: Group[];
  weekId: string;
}) {
  const [activeGroupId, setActiveGroupId] = useState<Id<"groups">>(groups[0]._id);
  const activeGroup = groups.find((g) => g._id === activeGroupId) ?? groups[0];

  const leaderboard   = useQuery(api.weeklyScores.getLeaderboard, { groupId: activeGroupId, weekId });
  const prevScores    = useQuery(api.weeklyScores.getPreviousWeekScores, { groupId: activeGroupId, weekId });
  const gameplan      = useQuery(api.weeklyGameplans.getForUser, { userId, weekId });
  const topScore      = leaderboard?.[0]?.totalScore ?? 0;

  return (
    <div className="flex flex-col min-h-screen px-4 pt-12 pb-6">

      {/* ── Header ── */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-1)] leading-tight">
              {activeGroup.emoji && <span className="mr-1.5">{activeGroup.emoji}</span>}
              {activeGroup.name}
            </h1>
            <p className="text-xs text-[var(--text-3)] mt-0.5">{getWeekLabel(weekId)}</p>
          </div>
          <a href="/dashboard/group-settings"
            className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-3)]">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
              <circle cx="10" cy="4"  r="1.5" fill="currentColor"/>
              <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
              <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
            </svg>
          </a>
        </div>

        {/* Stakes */}
        {activeGroup.weeklyStakes && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
            <span className="text-sm">⚔️</span>
            <span className="text-xs text-[var(--text-2)] font-medium">{activeGroup.weeklyStakes}</span>
          </div>
        )}
      </div>

      {/* ── Group tabs ── */}
      {groups.length > 1 && (
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-0.5 no-scrollbar">
          {groups.map((g) => (
            <button key={g._id} onClick={() => setActiveGroupId(g._id)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={g._id === activeGroupId
                ? { background: "var(--accent)", color: "black" }
                : { background: "var(--bg-raised)", color: "var(--text-2)", border: "1px solid var(--border)" }
              }>
              {g.emoji} {g.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Leaderboard ── */}
      {!leaderboard ? (
        <LeaderboardSkeleton />
      ) : leaderboard.length === 0 ? (
        <EmptyLeaderboard />
      ) : (
        <div className="flex flex-col gap-2 mb-5">
          {leaderboard.map((entry: any, index: number) => {
            const prev  = prevScores?.find((p: any) => p.userId === entry.userId);
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

      {/* ── Game plan ── */}
      {gameplan && (
        <GamePlanCard
          recommendation={gameplan.recommendation}
          predictedScore={gameplan.predictedScoreNeeded}
        />
      )}
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[80, 64, 48].map((w, i) => (
        <div key={i} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3">
            <div className="skeleton w-7 h-5 rounded" />
            <div className="skeleton w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3.5 rounded" style={{ width: `${w}%` }} />
              <div className="skeleton h-2.5 w-24 rounded" />
            </div>
            <div className="skeleton w-10 h-5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyLeaderboard() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 text-center">
      <div className="text-3xl mb-3">🏋️</div>
      <p className="text-sm font-medium text-[var(--text-1)] mb-1">No workouts logged yet</p>
      <p className="text-xs text-[var(--text-3)]">Be the first to score this week</p>
    </div>
  );
}
