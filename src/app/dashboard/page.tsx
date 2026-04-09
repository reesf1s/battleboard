"use client";

import { isDemoMode, DEMO_USER, DEMO_GROUPS, DEMO_LEADERBOARD, DEMO_PREV_SCORES, DEMO_GAMEPLAN } from "@/lib/demo";
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";
import { getWeekId } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  if (isDemoMode()) return <DemoDashboard />;
  return <RealDashboard />;
}

function DemoDashboard() {
  const weekId = getWeekId();
  return (
    <LeaderboardView
      userId={DEMO_USER._id}
      groups={DEMO_GROUPS as any}
      weekId={weekId}
      leaderboardData={DEMO_LEADERBOARD}
      prevScoresData={DEMO_PREV_SCORES}
      gameplanData={DEMO_GAMEPLAN}
    />
  );
}

function RealDashboard() {
  const { convexUser } = useCurrentUser();
  const groups = useQuery(
    api.groups.getUserGroups,
    convexUser ? { userId: convexUser._id } : "skip",
  );

  if (!convexUser) return <LoadingScreen />;
  if (groups === undefined) return <LoadingScreen />;
  if (groups === null || groups.length === 0) return <NoGroupState />;

  return (
    <LeaderboardView
      userId={convexUser._id}
      groups={groups as any}
      weekId={getWeekId()}
    />
  );
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
        />
        <span className="text-muted-foreground text-sm">Loading</span>
      </div>
    </div>
  );
}

function NoGroupState() {
  return (
    <div className="flex flex-col items-center justify-center h-screen px-8 text-center w-full">
      <div className="w-16 h-16 rounded-2xl bg-primary/[0.06] mx-auto mb-5 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-primary">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 className="app-display text-xl font-bold text-foreground mb-2">No groups yet</h2>
      <p className="text-muted-foreground text-[13px] leading-relaxed mb-6 max-w-[240px]">
        Create a group and invite your mates to start competing.
      </p>
      <a
        href="/onboarding"
        className="px-6 py-3 rounded-xl font-semibold text-primary-foreground text-[13px] transition-all active:scale-95 btn-gradient"
      >
        Create or Join Group
      </a>
    </div>
  );
}
