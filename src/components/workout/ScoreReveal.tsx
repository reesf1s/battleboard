"use client";
import { useEffect, useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getScoreColor, getScoreLabel } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ProLockedOverlay } from "@/components/ui/ProLockedOverlay";

interface ScoreRevealProps {
  workout?: any;
  workoutId?: any;
  onClose: () => void;
  isPro?: boolean;
}

export function ScoreReveal({ workout, workoutId, onClose, isPro }: ScoreRevealProps) {
  if (workout) return <ScoreRevealInner workout={workout} onClose={onClose} isPro={isPro} />;
  if (workoutId) return <ScoreRevealFromConvex workoutId={workoutId} onClose={onClose} isPro={isPro} />;
  return null;
}

function ScoreRevealFromConvex({ workoutId, onClose, isPro }: { workoutId: any; onClose: () => void; isPro?: boolean }) {
  const workout = useQuery(api.workouts.getById, { workoutId });
  return <ScoreRevealInner workout={workout} onClose={onClose} isPro={isPro} />;
}

function ScoreRevealInner({ workout, onClose, isPro }: { workout: any; onClose: () => void; isPro?: boolean }) {
  const [displayed, setDisplayed] = useState(0);
  const [phaseTwo, setPhaseTwo] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [shared, setShared] = useState(false);

  const handleShare = useCallback(async () => {
    const shareText = `I just scored ${workout?.effortScore} on my ${workout?.activityType} session! 💪 Think you can beat it?`;
    const shareData = {
      title: "Battleboard",
      text: shareText,
      url: "https://battleboard.app",
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareText} ${shareData.url}`);
      }
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (e) {
      // User cancelled share dialog — ignore
    }
  }, [workout?.effortScore, workout?.activityType]);

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
          <div className="w-14 h-14 rounded-2xl bg-primary/[0.06] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-primary">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
              <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-foreground mb-1.5">Taking longer than expected</p>
            <p className="text-[13px] text-muted-foreground max-w-[260px] leading-relaxed">Your workout is saved. The AI score will appear on the feed once ready.</p>
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
          className="p-2 rounded-lg hover:bg-white/[0.04] text-muted-foreground transition-colors"
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
          className="flex items-center justify-center w-[120px] h-[120px] rounded-3xl mb-4 animate-score-pulse"
          style={{
            background: `${color}06`,
            boxShadow: `0 0 40px ${color}12`,
            ["--pulse-color" as string]: `${color}20`,
          }}
        >
          <span className="app-score text-[56px] font-black" style={{ color }}>
            {displayed}
          </span>
        </div>
        <span
          className="text-[13px] font-bold px-4 py-1.5 rounded-lg uppercase tracking-widest"
          style={{ background: `${color}10`, color }}
        >
          {label}
        </span>
      </div>

      {/* Summary */}
      {workout.aiSummary && (
        <div className="bg-white/[0.03] border border-white/[0.04] rounded-xl px-3.5 py-3 mb-2.5">
          <p className="text-[13px] text-muted-foreground leading-relaxed">{workout.aiSummary}</p>
        </div>
      )}

      {/* AI reasoning */}
      {workout.aiReasoning && (
        !isPro ? (
          <div className="mb-5">
            <ProLockedOverlay
              featureName="AI Reasoning"
              description="See detailed analysis of your performance"
              compact={true}
            >
              <div
                className="bg-white/[0.03] border border-white/[0.04] rounded-xl px-3.5 py-3"
                style={{ borderLeft: `3px solid ${color}` }}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-[9px] font-extrabold text-primary bg-primary/[0.08] px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0 tracking-wider">AI</span>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{workout.aiReasoning}</p>
                </div>
              </div>
            </ProLockedOverlay>
          </div>
        ) : (
          <div
            className="bg-white/[0.03] border border-white/[0.04] rounded-xl px-3.5 py-3 mb-5"
            style={{ borderLeft: `3px solid ${color}` }}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-[9px] font-extrabold text-primary bg-primary/[0.08] px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0 tracking-wider">AI</span>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{workout.aiReasoning}</p>
            </div>
          </div>
        )
      )}

      {/* Breakdown */}
      {phaseTwo && (
        !isPro ? (
          <div className="mb-5">
            <ProLockedOverlay
              featureName="Score Breakdown"
              description="See how your score was calculated"
              compact={true}
            >
              <div className="bg-white/[0.03] border border-white/[0.04] rounded-xl p-4 animate-fade-in">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Breakdown
                </p>
                <div className="space-y-3">
                  {breakdown.map(({ label, val, max }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <span className="text-[12px] text-muted-foreground w-24 flex-shrink-0">{label}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/[0.05]">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${Math.min(100, (val / max) * 100)}%`,
                            background: color,
                          }}
                        />
                      </div>
                      <span className="app-score text-[12px] font-bold text-muted-foreground w-7 text-right">
                        {typeof val === "number" ? val.toFixed(1) : "0.0"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ProLockedOverlay>
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/[0.04] rounded-xl p-4 mb-5 animate-fade-in">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Breakdown
            </p>
            <div className="space-y-3">
              {breakdown.map(({ label, val, max }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <span className="text-[12px] text-muted-foreground w-24 flex-shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/[0.05]">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.min(100, (val / max) * 100)}%`,
                        background: color,
                      }}
                    />
                  </div>
                  <span className="app-score text-[12px] font-bold text-muted-foreground w-7 text-right">
                    {typeof val === "number" ? val.toFixed(1) : "0.0"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      <Button onClick={onClose} className="w-full btn-gradient text-primary-foreground" size="lg">
        Done
      </Button>
      <button
        onClick={handleShare}
        className="w-full bg-white/[0.06] text-foreground border border-white/[0.08] hover:bg-white/[0.1] mt-2.5 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
      >
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
          <path d="M4 12v4a2 2 0 002 2h8a2 2 0 002-2v-4M13 5l-3-3m0 0L7 5m3-3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {shared ? "Copied!" : "Share Score"}
      </button>
    </div>
  );
}
