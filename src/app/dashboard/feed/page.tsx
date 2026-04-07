"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { WorkoutCard } from "@/components/feed/WorkoutCard";

export default function FeedPage() {
  const { convexUser } = useCurrentUser();

  const groups = useQuery(
    api.groups.getUserGroups,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  const firstGroup = groups?.[0];

  const feed = useQuery(
    api.workouts.getGroupFeed,
    firstGroup ? { groupId: firstGroup._id } : "skip"
  );

  return (
    <div className="flex flex-col min-h-screen px-4 pt-12 pb-8">
      <h1 className="text-lg font-bold text-[var(--text-1)] mb-4">Feed</h1>

      {!feed ? (
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
        <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 h-28 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyFeed() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 text-center">
      <div className="text-4xl mb-3">🏋️</div>
      <p className="text-[var(--text-2)] text-sm">
        No workouts yet. Log one and get the competition started!
      </p>
    </div>
  );
}
