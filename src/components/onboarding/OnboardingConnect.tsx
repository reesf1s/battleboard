"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Id } from "../../../convex/_generated/dataModel";

interface OnboardingConnectProps {
  userId: Id<"users">;
  onNext: () => void;
}

export function OnboardingConnect({ userId, onNext }: OnboardingConnectProps) {
  const [stravaConnected, setStravaConnected] = useState(false);

  const handleStravaConnect = () => {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID!,
      redirect_uri: `${window.location.origin}/api/strava/callback`,
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
        <h1 className="text-2xl font-black text-[var(--text-primary)] mb-2">
          Where do your workouts live?
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Connect your fitness tracker for automatic sync, or log manually — your call.
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        {/* Strava */}
        <button
          onClick={handleStravaConnect}
          className="glass-card p-4 flex items-center gap-4 text-left transition-all active:scale-[0.98]"
          style={
            stravaConnected
              ? { borderColor: "var(--accent-primary)", background: "rgba(50,215,75,0.06)" }
              : {}
          }
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: "rgba(252,76,2,0.15)" }}
          >
            🏃
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--text-primary)]">Strava</span>
              {stravaConnected && (
                <span className="text-xs text-[var(--accent-primary)] font-medium">✓ Connected</span>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Auto-syncs runs, rides, workouts and more
            </p>
          </div>
        </button>

        {/* Garmin */}
        <div className="glass-card p-4 flex items-center gap-4 opacity-50">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: "rgba(0,166,123,0.15)" }}
          >
            ⌚
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--text-primary)]">Garmin</span>
              <span className="text-xs text-[var(--text-tertiary)] px-2 py-0.5 rounded-full bg-white/5">
                Coming soon
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Connect your Garmin device
            </p>
          </div>
        </div>

        {/* Manual */}
        <button
          onClick={onNext}
          className="glass-card p-4 flex items-center gap-4 text-left transition-all active:scale-[0.98]"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            ✍️
          </div>
          <div>
            <span className="font-semibold text-[var(--text-primary)]">Log manually</span>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Quick manual entry after each workout
            </p>
          </div>
        </button>
      </div>

      <div className="mt-auto">
        <Button onClick={onNext} className="w-full" size="lg">
          Continue →
        </Button>
        <p className="text-center text-xs text-[var(--text-tertiary)] mt-3">
          You can always connect more sources later in Settings
        </p>
      </div>
    </div>
  );
}
