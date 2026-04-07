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

interface LeaderboardViewProps {
  userId: Id<"users">;
  groups: Group[];
  weekId: string;
}

export function LeaderboardView({ userId, groups, weekId }: LeaderboardViewProps) {
  const [activeGroupId, setActiveGroupId] = useState<Id<"groups">>(groups[0]._id);

  const activeGroup = groups.find((g) => g._id === activeGroupId) || groups[0];

  const leaderboard = useQuery(api.weeklyScores.getLeaderboard, {
    groupId: activeGroupId,
    weekId,
  });

  const prevScores = useQuery(api.weeklyScores.getPreviousWeekScores, {
    groupId: activeGroupId,
    weekId,
  });

  const gameplan = useQuery(api.weeklyGameplans.getForUser, {
    userId,
    weekId,
  });

  const topScore = leaderboard?.[0]?.totalScore || 0;

  return (
    <div className="flex flex-col min-h-screen px-4 pt-14 pb-8">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {activeGroup.emoji} {activeGroup.name}
          </h1>
          <a href="/dashboard/group-settings" className="text-[var(--text-tertiary)]">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <circle cx="12" cy="5" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="19" r="1.5" fill="currentColor" />
            </svg>
          </a>
        </div>
        <p className="text-xs text-[var(--text-tertiary)]">{getWeekLabel(weekId)}</p>
      </div>

      {/* Stakes banner */}
      {activeGroup.weeklyStakes && (
        <div
          className="glass-card-sm px-4 py-2.5 mb-4 flex items-center gap-2"
          style={{ borderColor: "var(--accent-primary)40" }}
        >
          <span className="text-base">⚔️</span>
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            {activeGroup.weeklyStakes}
          </span>
        </div>
      )}

      {/* Group selector */}
      {groups.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
          {groups.map((group) => (
            <button
              key={group._id}
              onClick={() => setActiveGroupId(group._id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                group._id === activeGroupId
                  ? "bg-[var(--accent-primary)] text-black"
                  : "glass-card-sm text-[var(--text-secondary)]"
              }`}
            >
              {group.emoji} {group.name}
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
        <div className="flex flex-col gap-3 mb-4">
          {leaderboard.map((entry: any, index: number) => {
            const prevScore = prevScores?.find(
              (p: any) => p.userId === entry.userId
            );
            const trend = prevScore
              ? entry.totalScore - prevScore.totalScore
              : null;
            const isCurrentUser = entry.userId === userId;

            return (
              <LeaderboardCard
                key={entry._id}
                entry={entry as any}
                rank={index + 1}
                topScore={topScore}
                trend={trend}
                isCurrentUser={isCurrentUser}
                weekId={weekId}
              />
            );
          })}
        </div>
      )}

      {/* Game plan */}
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
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card p-4 h-20 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyLeaderboard() {
  return (
    <div className="glass-card p-8 text-center">
      <div className="text-4xl mb-3">💪</div>
      <p className="text-[var(--text-secondary)] text-sm">
        No workouts logged this week yet. Be the first!
      </p>
    </div>
  );
}
