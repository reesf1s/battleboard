"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isDemoMode, DEMO_USER } from "@/lib/demo";
import { OnboardingConnect } from "@/components/onboarding/OnboardingConnect";
import { OnboardingGroup } from "@/components/onboarding/OnboardingGroup";

type Step = "connect" | "group";

export default function OnboardingPage() {
  if (isDemoMode()) return <DemoOnboarding />;
  return <RealOnboarding />;
}

function DemoOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("connect");
  const user = DEMO_USER;

  return (
    <OnboardingShell step={step}>
      {step === "connect" && (
        <OnboardingConnect userId={user._id} onNext={() => setStep("group")} />
      )}
      {step === "group" && (
        <OnboardingGroup userId={user._id} onComplete={() => router.push("/dashboard")} />
      )}
    </OnboardingShell>
  );
}

function RealOnboarding() {
  const { useCurrentUser } = require("@/hooks/useCurrentUser");
  const router = useRouter();
  const [step, setStep] = useState<Step>("connect");
  const { convexUser } = useCurrentUser();

  if (!convexUser) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--bg-base)" }}>
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <OnboardingShell step={step}>
      {step === "connect" && (
        <OnboardingConnect userId={convexUser._id} onNext={() => setStep("group")} />
      )}
      {step === "group" && (
        <OnboardingGroup userId={convexUser._id} onComplete={() => router.push("/dashboard")} />
      )}
    </OnboardingShell>
  );
}

function OnboardingShell({ step, children }: { step: Step; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col px-5 py-12 max-w-md mx-auto" style={{ background: "var(--bg-base)" }}>
      {/* Progress */}
      <div className="flex gap-2 mb-10">
        {(["connect", "group"] as Step[]).map((s, i) => (
          <div key={s} className="h-0.5 flex-1 rounded-full transition-all"
            style={{ background: i <= (step === "connect" ? 0 : 1) ? "var(--accent)" : "var(--border)" }} />
        ))}
      </div>
      {children}
    </div>
  );
}
