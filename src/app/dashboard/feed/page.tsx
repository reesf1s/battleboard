"use client";

import { isDemoMode, DEMO_USER, DEMO_FEED } from "@/lib/demo";
import { WorkoutCard } from "@/components/feed/WorkoutCard";

export default function FeedPage() {
  if (isDemoMode()) return <DemoFeed />;
  return <RealFeed />;
}

function DemoFeed() {
  return (
    <div className="flex flex-col min-h-screen px-4 pt-14 pb-8">
      <h1 className="app-display text-2xl font-bold text-[var(--text-1)] mb-5 tracking-tight">Feed</h1>
      <div className="flex flex-col gap-3">
        {DEMO_FEED.map((workout: any) => (
          <WorkoutCard
            key={workout._id}
            workout={workout}
            currentUserId={DEMO_USER._id}
          />
        ))}
      </div>
    </div>
  );
}

function RealFeed() {
  const { useCurrentUser } = require("@/hooks/useCurrentUser");
  const { useQuery, useMutation } = require("convex/react");
  const { api } = require("../../../../convex/_generated/api");

  const { convexUser } = useCurrentUser();
  const toggleReaction = useMutation(api.reactions.toggle);
  const groups = useQuery(
    api.groups.getUserGroups,
    convexUser ? { userId: convexUser._id } : "skip",
  );
  const firstGroup = groups?.[0];
  const feed = useQuery(
    api.workouts.getGroupFeed,
    firstGroup ? { groupId: firstGroup._id } : "skip",
  );

  return (
    <div className="flex flex-col min-h-screen px-4 pt-14 pb-8">
      <h1 className="app-display text-2xl font-bold text-[var(--text-1)] mb-5 tracking-tight">Feed</h1>

      {!convexUser || groups === undefined || !feed ? (
        <FeedSkeleton />
      ) : feed.length === 0 ? (
        <EmptyFeed />
      ) : (
        <div className="flex flex-col gap-3">
          {feed.map((workout: any) => (
            <WorkoutCard
              key={workout._id}
              workout={workout as any}
              currentUserId={convexUser?._id}
              toggleReaction={toggleReaction}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl h-32"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="skeleton w-8 h-8 rounded-full" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-2/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyFeed() {
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
          <path d="M12 20V10M18 20V4M6 20v-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-[var(--text-1)] mb-1">No workouts yet</p>
      <p className="text-xs text-[var(--text-3)]">Log a session to get the competition started</p>
    </div>
  );
}
