"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { getScoreColor, getScoreTier, getScoreLabel, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface ScoreRevealProps {
  workoutId: Id<"workouts">;
  onClose: () => void;
}

export function ScoreReveal({ workoutId, onClose }: ScoreRevealProps) {
  const workout = useQuery(api.workouts.getById, { workoutId });
  const [displayScore, setDisplayScore] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    if (!workout?.effortScore) return;

    let start = 0;
    const end = workout.effortScore;
    const duration = 1000;
    const step = (end / duration) * 16;

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplayScore(end);
        clearInterval(timer);
        setTimeout(() => setShowBreakdown(true), 300);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [workout?.effortScore]);

  if (!workout || !workout.scored) return null;

  const color = getScoreColor(workout.effortScore);
  const tier = getScoreTier(workout.effortScore);
  const label = getScoreLabel(workout.effortScore);

  return (
    <div className="px-5 pb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Score Revealed</h2>
        <button onClick={onClose} className="text-[var(--text-tertiary)] p-1">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Big score */}
      <div className="flex flex-col items-center py-8">
        <div className="relative animate-score-reveal">
          {/* Rings */}
          {[1, 2].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{
                border: `2px solid ${color}`,
                animation: `score-ring ${0.8 + i * 0.3}s ease-out ${i * 0.2}s forwards`,
                opacity: 0,
              }}
            />
          ))}
          <div
            className="w-36 h-36 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle at center, ${color}20 0%, transparent 70%)`,
              border: `3px solid ${color}50`,
              boxShadow: `0 0 40px ${color}30, 0 0 80px ${color}15`,
            }}
          >
            <span className="text-6xl font-black" style={{ color }}>
              {displayScore}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span
            className="text-base font-bold px-4 py-1.5 rounded-full"
            style={{ background: `${color}20`, color }}
          >
            {label}
          </span>
        </div>
      </div>

      {/* AI Summary */}
      <div
        className="px-4 py-3 rounded-xl mb-3 animate-slide-up"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid var(--glass-border)",
          animationDelay: "0.2s",
          opacity: 0,
          animationFillMode: "forwards",
        }}
      >
        <p className="text-sm text-[var(--text-secondary)]">{workout.aiSummary}</p>
      </div>

      {/* AI Reasoning */}
      {workout.aiReasoning && (
        <div
          className="px-4 py-3 rounded-xl mb-5 animate-slide-up"
          style={{
            background: `${color}08`,
            border: `1px solid ${color}20`,
            animationDelay: "0.4s",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          <div className="flex items-start gap-2">
            <span className="text-base flex-shrink-0 mt-0.5">🤖</span>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {workout.aiReasoning}
            </p>
          </div>
        </div>
      )}

      {/* Breakdown */}
      {showBreakdown && (
        <div className="glass-card-sm p-4 mb-5 animate-fade-in">
          <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
            Score Breakdown
          </h4>
          <div className="space-y-2">
            {[
              { label: "Intensity", value: workout.intensityScore, max: 10 },
              { label: "Duration", value: workout.durationScore, max: 10 },
              { label: "Personal effort", value: workout.personalEffortScore, max: 10 },
              { label: "Consistency bonus", value: workout.consistencyBonus, max: 2 },
            ].map(({ label, value, max }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-[var(--text-tertiary)] w-28 flex-shrink-0">
                  {label}
                </span>
                <div
                  className="flex-1 h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(value / max) * 100}%`,
                      background: `linear-gradient(90deg, ${color}80, ${color})`,
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-[var(--text-secondary)] w-8 text-right">
                  {value.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button onClick={onClose} className="w-full" variant="secondary">
        Done
      </Button>
    </div>
  );
}
