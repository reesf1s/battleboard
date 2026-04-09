"use client";

import { isDemoMode, DEMO_USER, DEMO_FEED } from "@/lib/demo";
import { WorkoutCard } from "@/components/feed/WorkoutCard";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card } from "@/components/ui/card";

export default function FeedPage() {
  if (isDemoMode()) return <DemoFeed />;
  return <RealFeed />;
}

function DemoFeed() {
  return (
    <div className="flex flex-col min-h-screen w-full px-4 pt-14 pb-8">
      <h1 className="app-display text-2xl font-bold text-foreground mb-5 tracking-tight">Feed</h1>
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
    <div className="flex flex-col min-h-screen w-full px-4 pt-14 pb-8">
      <h1 className="app-display text-2xl font-bold text-foreground mb-5 tracking-tight">Feed</h1>

      {!convexUser || groups === undefined ? (
        <FeedSkeleton />
      ) : groups.length === 0 ? (
        <NoGroupFeed />
      ) : !feed ? (
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
              toggleReaction={toggleReaction as any}
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
        <Card key={i} className="gap-0 py-0 h-32">
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="skeleton w-9 h-9 rounded-lg" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-2/3 rounded" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function NoGroupFeed() {
  return (
    <Card className="gap-0 py-10 items-center text-center">
      <div
        className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
        style={{ background: "rgba(0,240,181,0.08)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-primary">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">Join a group to see the feed</p>
      <p className="text-xs text-muted-foreground">Create or join a group from the Board tab to start</p>
    </Card>
  );
}

function EmptyFeed() {
  return (
    <Card className="gap-0 py-10 items-center text-center">
      <div
        className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
        style={{ background: "rgba(0,240,181,0.08)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-primary">
          <path d="M12 20V10M18 20V4M6 20v-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">No workouts yet</p>
      <p className="text-xs text-muted-foreground">Log a session to get the competition started</p>
    </Card>
  );
}
