"use client";

import { isDemoMode, DEMO_USER, DEMO_GROUPS, DEMO_WORKOUTS } from "@/lib/demo";
import { ProfileView } from "@/components/profile/ProfileView";

export default function ProfilePage() {
  if (isDemoMode()) return <DemoProfile />;
  return <RealProfile />;
}

function DemoProfile() {
  return (
    <ProfileView
      user={DEMO_USER as any}
      groups={DEMO_GROUPS as any}
      workouts={DEMO_WORKOUTS as any}
    />
  );
}

function RealProfile() {
  const { useCurrentUser } = require("@/hooks/useCurrentUser");
  const { useQuery } = require("convex/react");
  const { api } = require("../../../../convex/_generated/api");

  const { convexUser } = useCurrentUser();
  const groups = useQuery(
    api.groups.getUserGroups,
    convexUser ? { userId: convexUser._id } : "skip",
  );
  const workouts = useQuery(
    api.workouts.getUserWorkouts,
    convexUser ? { userId: convexUser._id } : "skip",
  );

  if (!convexUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <ProfileView
      user={convexUser}
      groups={groups || []}
      workouts={workouts || []}
    />
  );
}
