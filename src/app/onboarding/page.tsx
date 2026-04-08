"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isDemoMode, DEMO_USER } from "@/lib/demo";
import { OnboardingConnect } from "@/components/onboarding/OnboardingConnect";
import { OnboardingGroup } from "@/components/onboarding/OnboardingGroup";
import { Button } from "@/components/ui/Button";

type Step = "connect" | "group";

export default function OnboardingPage() {
  const router = useRouter();
  const demo = isDemoMode();
  const [step, setStep] = useState<Step>("connect");

  // In real mode, get user from Clerk + Convex
  let convexUser: any = null;
  if (!demo) {
    const { useCurrentUser } = require("@/hooks/useCurrentUser");
    const result = useCurrentUser();
    convexUser = result.convexUser;
  } else {
    convexUser = DEMO_USER;
  }

  if (!convexUser) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--bg-base)" }}>
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-5 py-12 max-w-md mx-auto" style={{ background: "var(--bg-base)" }}>
      {/* Progress */}
      <div className="flex gap-2 mb-10">
        {(["connect", "group"] as Step[]).map((s, i) => (
          <div key={s} className="h-0.5 flex-1 rounded-full transition-all"
            style={{ background: i <= (step === "connect" ? 0 : 1) ? "var(--accent)" : "var(--border)" }} />
        ))}
      </div>

      {step === "connect" && (
        <OnboardingConnect userId={convexUser._id} onNext={() => setStep("group")} />
      )}

      {step === "group" && (
        <OnboardingGroup userId={convexUser._id} onComplete={() => router.push("/dashboard")} />
      )}
    </div>
  );
}
