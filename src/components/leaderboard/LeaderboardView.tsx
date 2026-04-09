"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  leaderboardData?: any[];
  prevScoresData?: any[];
  gameplanData?: { recommendation: string; predictedScoreNeeded: number } | null;
}

export function LeaderboardView(props: LeaderboardViewProps) {
  if (props.leaderboardData) return <LeaderboardViewStatic {...props} />;
  return <LeaderboardViewLive {...props} />;
}

function LeaderboardViewStatic(props: LeaderboardViewProps) {
  return (
    <LeaderboardViewInner
      {...props}
      leaderboard={props.leaderboardData!}
      prevScores={props.prevScoresData}
      gameplan={props.gameplanData}
    />
  );
}

function LeaderboardViewLive({ userId, groups, weekId }: LeaderboardViewProps) {
  const [activeGroupId, setActiveGroupId] = useState<any>(groups[0]?._id);
  const leaderboard = useQuery(api.weeklyScores.getLeaderboard, { groupId: activeGroupId, weekId });
  const prevScores = useQuery(api.weeklyScores.getPreviousWeekScores, { groupId: activeGroupId, weekId });
  const gameplan = useQuery(api.weeklyGameplans.getForUser, { userId, weekId });

  return (
    <LeaderboardViewInner
      userId={userId}
      groups={groups}
      weekId={weekId}
      leaderboard={leaderboard}
      prevScores={prevScores}
      gameplan={gameplan}
      activeGroupId={activeGroupId}
      onGroupChange={setActiveGroupId}
    />
  );
}

function LeaderboardViewInner({
  userId,
  groups,
  weekId,
  leaderboard,
  prevScores,
  gameplan,
  activeGroupId: controlledGroupId,
  onGroupChange,
}: {
  userId: any;
  groups: Group[];
  weekId: string;
  leaderboard: any[] | undefined;
  prevScores: any[] | undefined;
  gameplan: any;
  activeGroupId?: any;
  onGroupChange?: (id: any) => void;
}) {
  const [internalGroupId, setInternalGroupId] = useState<any>(groups[0]?._id);
  const activeGroupId = controlledGroupId ?? internalGroupId;
  const setActiveGroupId = onGroupChange ?? setInternalGroupId;
  const activeGroup = groups.find((g) => g._id === activeGroupId) ?? groups[0];
  const topScore = leaderboard?.[0]?.totalScore ?? 0;

  return (
    <div className="flex flex-col min-h-screen w-full px-5 pt-12 pb-8">
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-1">
          <div className="min-w-0 flex-1">
            <h1 className="app-display text-[26px] font-extrabold text-foreground leading-tight tracking-tight truncate">
              {activeGroup?.name ?? "Leaderboard"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-medium tracking-widest uppercase">
              {getWeekLabel(weekId)}
            </p>
          </div>
          <a
            href="/dashboard/group-settings"
            className="p-2.5 rounded-xl hover:bg-white/[0.04] active:bg-white/[0.07] transition-colors text-muted-foreground flex-shrink-0"
            aria-label="Group settings"
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
              <circle cx="10" cy="4" r="1.5" fill="currentColor" />
              <circle cx="10" cy="10" r="1.5" fill="currentColor" />
              <circle cx="10" cy="16" r="1.5" fill="currentColor" />
            </svg>
          </a>
        </div>

        {/* Stakes */}
        {activeGroup?.weeklyStakes && (
          <div
            className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(0,240,181,0.04) 0%, rgba(0,240,181,0.01) 100%)",
              border: "1px solid rgba(0,240,181,0.08)",
            }}
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 flex-shrink-0 text-primary">
              <path d="M8 1L10 5.5L15 6.2L11.5 9.6L12.4 14.5L8 12.2L3.6 14.5L4.5 9.6L1 6.2L6 5.5L8 1Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
            </svg>
            <span className="text-sm text-muted-foreground font-medium">{activeGroup.weeklyStakes}</span>
          </div>
        )}
      </div>

      {/* Group tabs */}
      {groups.length > 1 && (
        <Tabs
          value={activeGroupId}
          onValueChange={setActiveGroupId}
          className="mb-6"
        >
          <TabsList className="w-full h-auto p-1 overflow-x-auto no-scrollbar">
            {groups.map((g) => (
              <TabsTrigger
                key={g._id}
                value={g._id}
                className="flex-shrink-0 text-xs font-semibold data-active:bg-primary data-active:text-primary-foreground"
              >
                {g.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
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
        <Card key={i} className="gap-0 py-4">
          <div className="flex items-center gap-3 px-4">
            <div className="skeleton w-7 h-7 rounded-lg" />
            <div className="skeleton w-9 h-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3.5 rounded" style={{ width: `${w}%` }} />
              <div className="skeleton h-2.5 w-24 rounded" />
            </div>
            <div className="skeleton w-10 h-6 rounded" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyLeaderboard() {
  return (
    <Card className="gap-0 py-12 items-center text-center">
      <div className="relative w-20 h-20 mx-auto mb-5 flex items-center justify-center">
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-2xl animate-pulse"
          style={{
            background: "conic-gradient(from 0deg, rgba(0,240,181,0.12), rgba(0,240,181,0.02), rgba(0,240,181,0.12))",
            boxShadow: "0 0 24px rgba(0,240,181,0.08)",
          }}
        />
        {/* Inner surface */}
        <div
          className="relative w-16 h-16 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(145deg, rgba(0,240,181,0.1) 0%, rgba(0,240,181,0.03) 100%)",
            border: "1px solid rgba(0,240,181,0.12)",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-primary">
            <path d="M12 2L15 8.5L22 9.3L17 14.1L18.2 21L12 17.7L5.8 21L7 14.1L2 9.3L9 8.5L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <p className="text-base font-bold text-foreground mb-1.5">No scores yet this week</p>
      <p className="text-sm text-muted-foreground max-w-[220px]">Log a workout to claim the top spot</p>
    </Card>
  );
}
