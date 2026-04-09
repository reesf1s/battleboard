"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

export function useCurrentUser() {
  const { user, isLoaded } = useUser();
  const getOrCreate = useMutation(api.users.getOrCreate);
  const convexUser = useQuery(
    api.users.getByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  useEffect(() => {
    if (!user) return;
    getOrCreate({
      clerkId: user.id,
      name: user.fullName || user.firstName || "User",
      email: user.primaryEmailAddress?.emailAddress,
      avatarUrl: user.imageUrl,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, getOrCreate]);

  return {
    clerkUser: user,
    convexUser,
    isLoaded: isLoaded && convexUser !== undefined,
    isSignedIn: !!user,
    isPro: convexUser?.subscriptionTier === "pro",
    subscriptionTier: convexUser?.subscriptionTier ?? null,
  };
}
