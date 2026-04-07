"use client";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { getScoreColor, getScoreTier, getScoreLabel } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function ScoreReveal({ workoutId, onClose }: { workoutId: Id<"workouts">; onClose: () => void }) {
  const workout = useQuery(api.workouts.getById, { workoutId });
  const [displayed, setDisplayed] = useState(0);
  const [phaseTwo, setPhaseTwo]   = useState(false);

  useEffect(() => {
    if (!workout?.effortScore) return;
    const target   = workout.effortScore;
    const duration = 900;
    const startAt  = performance.now();
    const raf = (now: number) => {
      const t = Math.min(1, (now - startAt) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(ease * target));
      if (t < 1) requestAnimationFrame(raf);
      else setTimeout(() => setPhaseTwo(true), 200);
    };
    requestAnimationFrame(raf);
  }, [workout?.effortScore]);

  if (!workout?.scored) return null;

  const color = getScoreColor(workout.effortScore);
  const label = getScoreLabel(workout.effortScore);

  const breakdown = [
    { label: "Intensity",        val: workout.intensityScore,      max: 10 },
    { label: "Duration",         val: workout.durationScore,       max: 10 },
    { label: "Personal effort",  val: workout.personalEffortScore, max: 10 },
    { label: "Consistency",      val: workout.consistencyBonus,    max: 2  },
  ];

  return (
    <div className="px-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <h2 className="text-base font-bold text-[var(--text-1)]">Your Score</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-3)]">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Score */}
      <div className="flex flex-col items-center py-8 animate-score-in">
        <div className="relative flex items-center justify-center w-32 h-32 rounded-2xl mb-4"
          style={{ background: `${color}10`, border: `2px solid ${color}25` }}>
          <span className="text-6xl font-black tabular-nums" style={{ color }}>{displayed}</span>
        </div>
        <span className="text-sm font-bold px-4 py-1.5 rounded-lg"
          style={{ background: `${color}14`, color }}>{label}</span>
      </div>

      {/* Summary */}
      <div className="rounded-xl px-4 py-3 mb-3"
        style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
        <p className="text-sm text-[var(--text-2)]">{workout.aiSummary}</p>
      </div>

      {/* AI reasoning */}
      {workout.aiReasoning && (
        <div className="rounded-xl px-4 py-3 mb-4"
          style={{ background: "var(--bg-raised)", borderLeft: `3px solid ${color}`, paddingLeft: "14px" }}>
          <div className="flex items-start gap-2.5">
            <span className="text-base flex-shrink-0 mt-0.5">🤖</span>
            <p className="text-sm text-[var(--text-2)] leading-relaxed">{workout.aiReasoning}</p>
          </div>
        </div>
      )}

      {/* Breakdown */}
      {phaseTwo && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 mb-5 animate-fade-in">
          <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider mb-3">Breakdown</p>
          <div className="space-y-3">
            {breakdown.map(({ label, val, max }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-[var(--text-2)] w-32 flex-shrink-0">{label}</span>
                <div className="flex-1 h-1 rounded-full" style={{ background: "var(--bg-overlay)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(val / max) * 100}%`, background: color }} />
                </div>
                <span className="text-xs font-semibold text-[var(--text-2)] w-8 text-right tabular-nums">
                  {val.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button onClick={onClose} variant="secondary" className="w-full" size="lg">Done</Button>
    </div>
  );
}
