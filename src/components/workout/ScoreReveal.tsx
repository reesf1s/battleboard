"use client";
import { useEffect, useState } from "react";
import { getScoreColor, getScoreLabel } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface ScoreRevealProps {
  workout?: any;
  workoutId?: any;
  onClose: () => void;
}

export function ScoreReveal({ workout: passedWorkout, workoutId, onClose }: ScoreRevealProps) {
  // Use passed workout data, or query from Convex
  let workout = passedWorkout;
  if (!workout && workoutId) {
    const { useQuery } = require("convex/react");
    const { api } = require("../../../convex/_generated/api");
    workout = useQuery(api.workouts.getById, { workoutId });
  }

  const [displayed, setDisplayed] = useState(0);
  const [phaseTwo, setPhaseTwo] = useState(false);

  useEffect(() => {
    if (!workout?.effortScore) return;
    const target = workout.effortScore;
    const duration = 1000;
    const startAt = performance.now();
    const raf = (now: number) => {
      const t = Math.min(1, (now - startAt) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(ease * target));
      if (t < 1) requestAnimationFrame(raf);
      else setTimeout(() => setPhaseTwo(true), 300);
    };
    requestAnimationFrame(raf);
  }, [workout?.effortScore]);

  if (!workout?.scored) return null;

  const color = getScoreColor(workout.effortScore);
  const label = getScoreLabel(workout.effortScore);

  const breakdown = [
    { label: "Intensity", val: workout.intensityScore, max: 10 },
    { label: "Duration", val: workout.durationScore, max: 10 },
    { label: "Personal effort", val: workout.personalEffortScore, max: 10 },
    { label: "Consistency", val: workout.consistencyBonus, max: 2 },
  ];

  return (
    <div className="px-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <h2 className="app-display text-lg font-bold text-[var(--text-1)]">Your Score</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-3)] transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Score display */}
      <div className="flex flex-col items-center py-10 animate-score-in">
        <div
          className="relative flex items-center justify-center w-36 h-36 rounded-3xl mb-5 animate-score-pulse"
          style={{ background: `${color}08`, border: `2px solid ${color}20` }}
        >
          <span className="app-score text-7xl font-bold" style={{ color }}>
            {displayed}
          </span>
        </div>
        <span
          className="text-sm font-semibold px-4 py-1.5 rounded-xl tracking-wide"
          style={{ background: `${color}12`, color }}
        >
          {label}
        </span>
      </div>

      {/* Summary */}
      <div
        className="rounded-2xl px-4 py-3.5 mb-3"
        style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
      >
        <p className="text-sm text-[var(--text-2)] leading-relaxed">{workout.aiSummary}</p>
      </div>

      {/* AI reasoning */}
      {workout.aiReasoning && (
        <div
          className="rounded-2xl px-4 py-3.5 mb-5"
          style={{ background: "var(--bg-raised)", borderLeft: `3px solid ${color}` }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold"
              style={{ background: `${color}15`, color }}
            >
              AI
            </div>
            <p className="text-sm text-[var(--text-2)] leading-relaxed">{workout.aiReasoning}</p>
          </div>
        </div>
      )}

      {/* Breakdown */}
      {phaseTwo && (
        <div
          className="rounded-2xl p-5 mb-6 animate-fade-in"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-widest mb-4">
            Breakdown
          </p>
          <div className="space-y-4">
            {breakdown.map(({ label, val, max }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-[var(--text-2)] w-28 flex-shrink-0">{label}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-overlay)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(val / max) * 100}%`, background: color }}
                  />
                </div>
                <span className="app-score text-xs font-semibold text-[var(--text-2)] w-8 text-right">
                  {val.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button onClick={onClose} variant="secondary" className="w-full" size="lg">
        Done
      </Button>
    </div>
  );
}
