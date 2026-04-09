"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Id } from "../../../convex/_generated/dataModel";

interface OnboardingConnectProps {
  userId: Id<"users">;
  stravaConnected: boolean;
  onNext: () => void;
}

export function OnboardingConnect({ userId, stravaConnected, onNext }: OnboardingConnectProps) {
  const stravaClientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
  const stravaConfigured = stravaClientId && !stravaClientId.includes("your_") && !stravaClientId.includes("placeholder") && stravaClientId.length > 3;
  const [stravaLoading, setStravaLoading] = useState(false);

  const handleStravaConnect = () => {
    if (stravaConnected) {
      onNext();
      return;
    }
    if (!stravaConfigured) {
      onNext();
      return;
    }
    setStravaLoading(true);
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "https://fitness-ivory-omega.vercel.app";
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
    <div className="flex flex-col flex-1 w-full">
      <div className="mb-8">
        <h1 className="app-display text-2xl font-bold text-[var(--text-1)] mb-2">
          Connect your tracker
        </h1>
        <p className="text-[var(--text-2)] text-sm leading-relaxed">
          Link Strava to auto-import workouts, or log them manually — you can always change this later.
        </p>
      </div>

      <div className="flex flex-col gap-2.5 mb-8">
        {/* Strava */}
        <button
          onClick={handleStravaConnect}
          disabled={stravaLoading}
          className="rounded-xl border p-4 flex items-center gap-4 text-left transition-all active:scale-[0.98] disabled:opacity-60"
          style={{
            background: stravaConnected ? "rgba(34,211,238,0.04)" : "var(--bg-surface)",
            borderColor: stravaConnected ? "rgba(34,211,238,0.2)" : "var(--border)",
          }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(252,76,2,0.1)" }}
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" style={{ color: "#FC4C02" }}>
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" fill="currentColor"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--text-1)] text-sm">Strava</span>
              {stravaConnected && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: "rgba(34,211,238,0.1)", color: "#22D3EE" }}>
                  Connected
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-3)] mt-0.5 truncate">
              {stravaConnected
                ? "Your workouts will sync automatically"
                : "Auto-syncs runs, rides, workouts and more"}
            </p>
          </div>
          {stravaLoading ? (
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
          ) : stravaConnected ? (
            <svg viewBox="0 0 16 16" fill="none" className="w-5 h-5 flex-shrink-0">
              <path d="M3 8.5l3.5 3.5L13 4.5" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[var(--text-3)] flex-shrink-0">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </button>

        {/* Garmin */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex items-center gap-4 opacity-40">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "rgba(0,166,123,0.08)" }}>
            ⌚
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--text-1)] text-sm">Garmin</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: "var(--bg-overlay)", color: "var(--text-3)" }}>
                Coming soon
              </span>
            </div>
            <p className="text-xs text-[var(--text-3)] mt-0.5">Connect your Garmin device</p>
          </div>
        </div>

        {/* Manual */}
        <button
          onClick={onNext}
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex items-center gap-4 text-left transition-all active:scale-[0.98] hover:border-[var(--border-strong)]"
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "var(--bg-overlay)" }}>
            ✍️
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-[var(--text-1)] text-sm">Log manually</span>
            <p className="text-xs text-[var(--text-3)] mt-0.5">Quick manual entry after each workout</p>
          </div>
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[var(--text-3)] flex-shrink-0">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="mt-auto">
        <Button onClick={onNext} className="w-full" size="lg">
          {stravaConnected ? "Next" : "Continue"}
        </Button>
        <p className="text-center text-xs text-[var(--text-3)] mt-3">
          You can always connect more sources later in Settings
        </p>
      </div>
    </div>
  );
}
