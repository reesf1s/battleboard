"use client";
import { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaderboardCard } from "./LeaderboardCard";
import { GamePlanCard } from "./GamePlanCard";
import { getWeekLabel } from "@/lib/utils";

interface Group {
  _id: any;
  name: string;
  emoji?: string;
  weeklyStakes?: string;
  inviteCode?: string;
}

interface LeaderboardViewProps {
  userId: any;
  groups: Group[];
  weekId: string;
  leaderboardData?: any[];
  prevScoresData?: any[];
  gameplanData?: { recommendation: string; predictedScoreNeeded: number } | null;
  isPro?: boolean;
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
      isPro={props.isPro}
    />
  );
}

function LeaderboardViewLive({ userId, groups, weekId, isPro }: LeaderboardViewProps) {
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
      isPro={isPro}
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
  isPro,
  activeGroupId: controlledGroupId,
  onGroupChange,
}: {
  userId: any;
  groups: Group[];
  weekId: string;
  leaderboard: any[] | undefined;
  prevScores: any[] | undefined;
  gameplan: any;
  isPro?: boolean;
  activeGroupId?: any;
  onGroupChange?: (id: any) => void;
}) {
  const [internalGroupId, setInternalGroupId] = useState<any>(groups[0]?._id);
  const activeGroupId = controlledGroupId ?? internalGroupId;
  const setActiveGroupId = onGroupChange ?? setInternalGroupId;
  const activeGroup = groups.find((g) => g._id === activeGroupId) ?? groups[0];
  const topScore = leaderboard?.[0]?.totalScore ?? 0;

  return (
    <div className="flex flex-col min-h-screen w-full px-4 pt-14 pb-8 gap-5">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="min-w-0 flex-1">
            <h1 className="app-display text-[22px] font-bold text-foreground leading-tight tracking-tight truncate">
              {activeGroup?.name ?? "Leaderboard"}
            </h1>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium tracking-widest uppercase">
              {getWeekLabel(weekId)}
            </p>
          </div>
          <ShareLeaderboardButton activeGroup={activeGroup} weekId={weekId} leaderboard={leaderboard} topScore={topScore} />
          <a
            href="/dashboard/group-settings"
            className="p-2 -mr-1 rounded-lg hover:bg-white/[0.04] transition-colors text-muted-foreground flex-shrink-0"
            aria-label="Group settings"
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
              <circle cx="10" cy="4" r="1.5" fill="currentColor" />
              <circle cx="10" cy="10" r="1.5" fill="currentColor" />
              <circle cx="10" cy="16" r="1.5" fill="currentColor" />
            </svg>
          </a>
        </div>
      </div>

      {/* Stakes */}
      {activeGroup?.weeklyStakes && (
        <div className="-mt-2 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-primary/[0.04] border border-primary/[0.08]">
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 flex-shrink-0 text-primary">
            <path d="M8 1L10 5.5L15 6.2L11.5 9.6L12.4 14.5L8 12.2L3.6 14.5L4.5 9.6L1 6.2L6 5.5L8 1Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
          </svg>
          <span className="text-[13px] text-muted-foreground leading-snug">{activeGroup.weeklyStakes}</span>
        </div>
      )}

      {/* Group tabs */}
      {groups.length > 1 && (
        <Tabs
          value={activeGroupId}
          onValueChange={setActiveGroupId}
          className="-mt-2"
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
        <div className="flex flex-col gap-2.5">
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
          isPro={isPro}
        />
      )}

      {/* Invite friends CTA */}
      <InviteFriendsCard activeGroup={activeGroup} />
    </div>
  );
}

function ShareLeaderboardButton({
  activeGroup,
  weekId,
  leaderboard,
  topScore,
}: {
  activeGroup: Group;
  weekId: string;
  leaderboard: any[] | undefined;
  topScore: number;
}) {
  const weekLabel = getWeekLabel(weekId);

  const handleShare = useCallback(async () => {
    const leaderName = leaderboard?.[0]?.user?.name ?? "Someone";
    const shareText = `${activeGroup.name} — ${weekLabel}. ${leaderName} is leading with ${topScore} points! Join the competition on Battleboard.`;
    const shareData = {
      title: activeGroup.name,
      text: shareText,
      url: "https://battleboard.app",
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareText} https://battleboard.app`);
      }
    } catch (e) {
      // User cancelled share dialog — ignore
    }
  }, [activeGroup.name, weekLabel, leaderboard, topScore]);

  return (
    <button
      onClick={handleShare}
      className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors text-muted-foreground flex-shrink-0"
      aria-label="Share leaderboard"
    >
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <path d="M4 12v4a2 2 0 002 2h8a2 2 0 002-2v-4M13 5l-3-3m0 0L7 5m3-3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[85, 70, 55].map((w, i) => (
        <Card key={i} className="gap-0 py-3.5">
          <div className="flex items-center gap-3 px-3.5">
            <div className="skeleton w-8 h-8 rounded-[10px]" />
            <div className="skeleton w-10 h-10 rounded-[10px]" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3.5 rounded" style={{ width: `${w}%` }} />
              <div className="skeleton h-2.5 w-20 rounded" />
            </div>
            <div className="skeleton w-12 h-7 rounded" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function InviteFriendsCard({ activeGroup }: { activeGroup: Group }) {
  const [copied, setCopied] = useState(false);

  const handleInvite = useCallback(async () => {
    const inviteCode = activeGroup?.inviteCode;
    const groupName = activeGroup?.name ?? "my group";
    const inviteLink = inviteCode ? `https://battleboard.app/join/${inviteCode}` : "https://battleboard.app";
    const shareText = `Join ${groupName} on Battleboard and let's compete! Use code: ${inviteCode ?? "N/A"}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Join ${groupName} on Battleboard`,
          text: shareText,
          url: inviteLink,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${inviteLink}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled share
    }
  }, [activeGroup]);

  return (
    <Card className="gap-0 py-0 overflow-hidden">
      <div className="px-4 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/[0.06] flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-primary">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="1.75" />
            <path d="M20 8v6M23 11h-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground">Invite friends</p>
          <p className="text-[11px] text-muted-foreground">More competition = more motivation</p>
        </div>
        <button
          onClick={handleInvite}
          className="px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-[12px] font-bold flex-shrink-0 active:scale-95 transition-transform"
        >
          {copied ? "Copied!" : "Invite"}
        </button>
      </div>
    </Card>
  );
}

function EmptyLeaderboard() {
  return (
    <Card className="gap-0 py-12 items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-primary/[0.06] mx-auto mb-4 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-primary">
          <path d="M12 2L15 8.5L22 9.3L17 14.1L18.2 21L12 17.7L5.8 21L7 14.1L2 9.3L9 8.5L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">No scores yet this week</p>
      <p className="text-xs text-muted-foreground">Log a workout to claim the top spot</p>
    </Card>
  );
}
