"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Id } from "../../../convex/_generated/dataModel";

interface OnboardingConnectProps {
  userId: Id<"users">;
  onNext: () => void;
}

export function OnboardingConnect({ userId, onNext }: OnboardingConnectProps) {
  const stravaClientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
  const stravaConfigured = stravaClientId && !stravaClientId.includes("your_");

  const handleStravaConnect = () => {
    if (!stravaConfigured) return;
    const origin = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "https://battleboard-rho.vercel.app");
    const params = new URLSearchParams({
      client_id: stravaClientId!,
      redirect_uri: `${origin}/api/strava/callback`,
      response_type: "code",
      approval_prompt: "auto",
      scope: "activity:read_all",
      state: userId,
    });
    window.location.href = `https://www.strava.com/oauth/authorize?${params}`;
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[var(--text-1)] mb-2">
          Where do your workouts live?
        </h1>
        <p className="text-[var(--text-2)] text-sm leading-relaxed">
          Connect your fitness tracker for automatic sync, or log manually — your call.
        </p>
      </div>

      <div className="flex flex-col gap-2.5 mb-8">
        <button
          onClick={handleStravaConnect}
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex items-center gap-4 text-left transition-all active:scale-[0.98] hover:border-[var(--border-strong)]">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: "rgba(252,76,2,0.12)" }}>
            🏃
          </div>
          <div className="flex-1">
            <span className="font-semibold text-[var(--text-1)] text-sm">Strava</span>
            <p className="text-xs text-[var(--text-3)] mt-0.5">Auto-syncs runs, rides, workouts and more</p>
          </div>
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[var(--text-3)] flex-shrink-0">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex items-center gap-4 opacity-40">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: "rgba(0,166,123,0.12)" }}>
            ⌚
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--text-1)] text-sm">Garmin</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                style={{ background: "var(--bg-overlay)", color: "var(--text-3)" }}>Soon</span>
            </div>
            <p className="text-xs text-[var(--text-3)] mt-0.5">Connect your Garmin device</p>
          </div>
        </div>

        <button
          onClick={onNext}
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex items-center gap-4 text-left transition-all active:scale-[0.98] hover:border-[var(--border-strong)]">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: "var(--bg-overlay)" }}>
            ✍️
          </div>
          <div className="flex-1">
            <span className="font-semibold text-[var(--text-1)] text-sm">Log manually</span>
            <p className="text-xs text-[var(--text-3)] mt-0.5">Quick manual entry after each workout</p>
          </div>
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[var(--text-3)] flex-shrink-0">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="mt-auto">
        <Button onClick={onNext} className="w-full" size="lg">Continue →</Button>
        <p className="text-center text-xs text-[var(--text-3)] mt-3">
          You can always connect more sources later in Settings
        </p>
      </div>
    </div>
  );
}
