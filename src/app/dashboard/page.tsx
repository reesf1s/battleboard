"use client";

import { isDemoMode, DEMO_USER, DEMO_GROUPS, DEMO_LEADERBOARD, DEMO_PREV_SCORES, DEMO_GAMEPLAN } from "@/lib/demo";
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";
import { getWeekId } from "@/lib/utils";

export default function DashboardPage() {
  if (isDemoMode()) return <DemoDashboard />;
  return <RealDashboard />;
}

/* ── Demo mode: static data, no providers needed ── */
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

/* ── Real mode: Clerk + Convex providers available ── */
function RealDashboard() {
  const { useCurrentUser } = require("@/hooks/useCurrentUser");
  const { useQuery } = require("convex/react");
  const { api } = require("../../../convex/_generated/api");
  const { getWeekId: gw } = require("@/lib/utils");

  const { convexUser } = useCurrentUser();
  const groups = useQuery(
    api.groups.getUserGroups,
    convexUser ? { userId: convexUser._id } : "skip",
  );

  if (!convexUser) return <LoadingScreen />;
  if (!groups || groups.length === 0) return <NoGroupState />;

  return (
    <LeaderboardView
      userId={convexUser._id}
      groups={groups as any}
      weekId={gw()}
    />
  );
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
        />
        <span className="text-[var(--text-3)] text-sm">Loading</span>
      </div>
    </div>
  );
}

function NoGroupState() {
  return (
    <div className="flex flex-col items-center justify-center h-screen px-8 text-center">
      <div
        className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
        style={{ background: "var(--accent-dim)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" style={{ color: "var(--accent)" }}>
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 className="app-display text-2xl font-bold text-[var(--text-1)] mb-2">No groups yet</h2>
      <p className="text-[var(--text-2)] text-sm leading-relaxed mb-7 max-w-[240px]">
        Create a group and invite your mates to start competing.
      </p>
      <a
        href="/onboarding/group"
        className="px-7 py-3 rounded-xl font-semibold text-black text-sm transition-all active:scale-95"
        style={{ background: "var(--accent)" }}
      >
        Create or Join Group
      </a>
    </div>
  );
}
