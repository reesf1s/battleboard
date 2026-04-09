"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { isDemoMode } from "@/lib/demo";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Blocks access to dashboard routes unless the user has an active
 * subscription (compete or pro) or is still within their 7-day trial.
 * Redirects unauthenticated / expired users to /subscription.
 */
export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  if (isDemoMode()) return <>{children}</>;
  return <SubscriptionGateInner>{children}</SubscriptionGateInner>;
}

function SubscriptionGateInner({ children }: { children: React.ReactNode }) {
  const { convexUser, isLoaded, isSignedIn } = useCurrentUser();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !convexUser) return;

    const { subscriptionStatus, subscriptionExpiresAt } = convexUser;

    // Active paying user — always allowed
    if (subscriptionStatus === "active") {
      setAllowed(true);
      return;
    }

    // Trial user — check if trial hasn't expired
    if (subscriptionStatus === "trial") {
      const now = Date.now();
      if (!subscriptionExpiresAt || subscriptionExpiresAt > now) {
        setAllowed(true);
        return;
      }
      // Trial expired — redirect
      router.replace("/subscription");
      return;
    }

    // Expired or no subscription — redirect
    router.replace("/subscription");
  }, [isLoaded, isSignedIn, convexUser, router]);

  // Still loading — show skeleton
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  // Waiting for redirect
  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
