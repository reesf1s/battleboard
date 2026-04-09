"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isDemoMode, DEMO_USER } from "@/lib/demo";
import { OnboardingConnect } from "@/components/onboarding/OnboardingConnect";
import { OnboardingGroup } from "@/components/onboarding/OnboardingGroup";
import { useCurrentUser } from "@/hooks/useCurrentUser";

type Step = "connect" | "group";

export default function OnboardingPage() {
  if (isDemoMode()) return <DemoOnboarding />;
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen" style={{ background: "var(--bg-base)" }}>
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
        </div>
      }
    >
      <RealOnboarding />
    </Suspense>
  );
}

function DemoOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("connect");
  const user = DEMO_USER;

  return (
    <OnboardingShell step={step}>
      {step === "connect" && (
        <OnboardingConnect
          userId={user._id}
          stravaConnected={false}
          onNext={() => setStep("group")}
        />
      )}
      {step === "group" && (
        <OnboardingGroup userId={user._id} onComplete={() => router.push("/dashboard")} />
      )}
    </OnboardingShell>
  );
}

function RealOnboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { convexUser } = useCurrentUser();
  const [step, setStep] = useState<Step>("connect");
  const [stravaBanner, setStravaBanner] = useState<"connected" | "error" | null>(null);

  useEffect(() => {
    const stravaParam = searchParams.get("strava");
    if (stravaParam === "connected") {
      setStravaBanner("connected");
      setStep("group");
      window.history.replaceState({}, "", "/onboarding");
    } else if (stravaParam === "error") {
      setStravaBanner("error");
      window.history.replaceState({}, "", "/onboarding");
    }
  }, [searchParams]);

  if (!convexUser) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--bg-base)" }}>
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <OnboardingShell step={step}>
      {/* Strava connected banner */}
      {stravaBanner === "connected" && step === "group" && (
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3 mb-6 animate-fade-in"
          style={{ background: "rgba(0,240,181,0.06)" }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,240,181,0.1)" }}>
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <path d="M3 8.5l3.5 3.5L13 4.5" stroke="#00F0B5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-1)]">Strava connected</p>
            <p className="text-xs text-[var(--text-3)]">Your workouts will sync automatically</p>
          </div>
        </div>
      )}

      {/* Strava error banner */}
      {stravaBanner === "error" && step === "connect" && (
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3 mb-6 animate-fade-in"
          style={{ background: "rgba(248,113,113,0.06)" }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(248,113,113,0.1)" }}>
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <path d="M8 5v3M8 10.5v.5" stroke="#F87171" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-1)]">Strava connection failed</p>
            <p className="text-xs text-[var(--text-3)]">Try again, or continue with manual logging</p>
          </div>
        </div>
      )}

      {step === "connect" && (
        <OnboardingConnect
          userId={convexUser._id}
          stravaConnected={convexUser.stravaConnected}
          onNext={() => setStep("group")}
        />
      )}
      {step === "group" && (
        <OnboardingGroup userId={convexUser._id} onComplete={() => router.push("/dashboard")} />
      )}
    </OnboardingShell>
  );
}

function OnboardingShell({ step, children }: { step: Step; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col px-5 py-12 w-full max-w-[480px] mx-auto" style={{ background: "var(--bg-base)" }}>
      {/* Progress */}
      <div className="flex gap-2 mb-10">
        {(["connect", "group"] as Step[]).map((s, i) => (
          <div
            key={s}
            className="h-1 flex-1 rounded-full transition-all"
            style={{
              background:
                i <= (step === "connect" ? 0 : 1) ? "var(--primary)" : "var(--bg-overlay)",
            }}
          />
        ))}
      </div>
      {children}
    </div>
  );
}
