"use client";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getScoreColor, getScoreLabel } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";

interface ScoreRevealProps {
  workout?: any;
  workoutId?: any;
  onClose: () => void;
}

export function ScoreReveal({ workout, workoutId, onClose }: ScoreRevealProps) {
  if (workout) return <ScoreRevealInner workout={workout} onClose={onClose} />;
  if (workoutId) return <ScoreRevealFromConvex workoutId={workoutId} onClose={onClose} />;
  return null;
}

function ScoreRevealFromConvex({ workoutId, onClose }: { workoutId: any; onClose: () => void }) {
  const workout = useQuery(api.workouts.getById, { workoutId });
  return <ScoreRevealInner workout={workout} onClose={onClose} />;
}

function ScoreRevealInner({ workout, onClose }: { workout: any; onClose: () => void }) {
  const [displayed, setDisplayed] = useState(0);
  const [phaseTwo, setPhaseTwo] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (workout?.scored) return;
    const t = setTimeout(() => setTimedOut(true), 30000);
    return () => clearTimeout(t);
  }, [workout?.scored]);

  useEffect(() => {
    if (!workout?.effortScore) return;
    const target = workout.effortScore;
    const duration = 1000;
    const startAt = performance.now();
    let rafId: number;
    let timeoutId: ReturnType<typeof setTimeout>;
    const animate = (now: number) => {
      const t = Math.min(1, (now - startAt) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(ease * target));
      if (t < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        timeoutId = setTimeout(() => setPhaseTwo(true), 300);
      }
    };
    rafId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [workout?.effortScore]);

  if (!workout?.scored) {
    if (timedOut) {
      return (
        <div className="flex flex-col items-center gap-5 py-14 px-5">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,240,181,0.08)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-primary">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
              <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-foreground mb-1.5">Taking longer than expected</p>
            <p className="text-sm text-muted-foreground max-w-[260px]">Your workout is saved. The AI score will appear on the feed once ready.</p>
          </div>
          <Button onClick={onClose} variant="secondary" className="w-full" size="lg">
            Close
          </Button>
        </div>
      );
    }
    return null;
  }

  const color = getScoreColor(workout.effortScore);
  const label = getScoreLabel(workout.effortScore);

  const breakdown = [
    { label: "Intensity", val: workout.intensityScore ?? 0, max: 10 },
    { label: "Duration", val: workout.durationScore ?? 0, max: 10 },
    { label: "Personal effort", val: workout.personalEffortScore ?? 0, max: 10 },
    { label: "Consistency", val: workout.consistencyBonus ?? 0, max: 2 },
  ];

  return (
    <div className="px-5 pb-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <h2 className="app-display text-lg font-bold text-foreground">Your Score</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
          aria-label="Close"
        >
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Score display */}
      <div className="flex flex-col items-center py-8 animate-score-in">
        <div
          className="flex items-center justify-center w-32 h-32 rounded-3xl mb-4 animate-score-pulse"
          style={{
            background: `${color}08`,
            ["--pulse-color" as string]: `${color}25`,
          }}
        >
          <span className="app-score text-6xl font-black" style={{ color }}>
            {displayed}
          </span>
        </div>
        <Badge
          className="text-sm font-bold px-4 py-1.5 uppercase tracking-widest border-transparent"
          style={{ background: `${color}12`, color }}
        >
          {label}
        </Badge>
      </div>

      {/* Summary */}
      {workout.aiSummary && (
        <div className="bg-white/[0.03] rounded-lg px-3.5 py-3 mb-2.5">
          <p className="text-sm text-muted-foreground leading-relaxed">{workout.aiSummary}</p>
        </div>
      )}

      {/* AI reasoning */}
      {workout.aiReasoning && (
        <div
          className="bg-white/[0.03] rounded-lg px-3.5 py-3 mb-5"
          style={{ borderLeft: `3px solid ${color}` }}
        >
          <div className="flex items-start gap-2.5">
            <Badge className="bg-primary/10 text-primary border-transparent text-[10px] font-bold mt-0.5 flex-shrink-0">AI</Badge>
            <p className="text-sm text-muted-foreground leading-relaxed">{workout.aiReasoning}</p>
          </div>
        </div>
      )}

      {/* Breakdown */}
      {phaseTwo && (
        <div className="bg-white/[0.03] rounded-lg p-4 mb-5 animate-fade-in">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Breakdown
          </p>
          <div className="space-y-3">
            {breakdown.map(({ label, val, max }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="text-xs text-muted-foreground w-24 flex-shrink-0">{label}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/[0.04]">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min(100, (val / max) * 100)}%`,
                      background: color,
                    }}
                  />
                </div>
                <span className="app-score text-xs font-semibold text-muted-foreground w-7 text-right">
                  {typeof val === "number" ? val.toFixed(1) : "0.0"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button onClick={onClose} className="w-full btn-gradient text-primary-foreground" size="lg">
        Done
      </Button>
    </div>
  );
}
