"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ProfileView } from "@/components/profile/ProfileView";

export default function ProfilePage() {
  const { convexUser, clerkUser } = useCurrentUser();

  const groups = useQuery(
    api.groups.getUserGroups,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  const workouts = useQuery(
    api.workouts.getUserWorkouts,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  if (!convexUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
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
