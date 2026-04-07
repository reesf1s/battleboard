"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";
import { getWeekId } from "@/lib/utils";
import { Id } from "../../../convex/_generated/dataModel";

export default function DashboardPage() {
  const { convexUser } = useCurrentUser();
  const groups = useQuery(
    api.groups.getUserGroups,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  if (!convexUser) return <LoadingScreen />;

  if (!groups || groups.length === 0) {
    return <NoGroupState />;
  }

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
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin"
        />
        <span className="text-[var(--text-secondary)] text-sm">Loading...</span>
      </div>
    </div>
  );
}

function NoGroupState() {
  return (
    <div className="flex flex-col items-center justify-center h-screen px-8 text-center">
      <div className="text-5xl mb-4">🏆</div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
        No groups yet
      </h2>
      <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
        Create a group and invite your mates to start competing.
      </p>
      <a
        href="/onboarding/group"
        className="px-6 py-3 rounded-full font-semibold text-black transition-all active:scale-95"
        style={{ background: "var(--accent-primary)" }}
      >
        Create or Join a Group
      </a>
    </div>
  );
}
