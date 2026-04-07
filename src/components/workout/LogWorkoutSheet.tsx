"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ScoreReveal } from "./ScoreReveal";
import { cn, getActivityEmoji } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const ACTIVITY_TYPES = [
  "Gym (Strength)", "Gym (Cardio)", "Running", "Walking", "Cycling",
  "Swimming", "Boxing/MMA", "Yoga/Pilates", "HIIT/CrossFit",
  "Team Sports", "Climbing", "Snowboarding/Skiing", "Dance", "Hiking", "Rowing", "Other",
];
const DISTANCE_ACTIVITIES = new Set(["Running","Walking","Cycling","Swimming","Hiking","Rowing"]);

type Step = "form" | "scoring" | "result";

export function LogWorkoutSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { convexUser } = useCurrentUser();
  const createWorkout  = useMutation(api.workouts.create);

  const [step, setStep]         = useState<Step>("form");
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [activity, setActivity] = useState("Gym (Strength)");
  const [hours, setHours]       = useState(0);
  const [mins, setMins]         = useState(45);
  const [distance, setDistance] = useState("");
  const [rpe, setRpe]           = useState(7);
  const [note, setNote]         = useState("");

  const reset = () => {
    setStep("form"); setWorkoutId(null); setActivity("Gym (Strength)");
    setHours(0); setMins(45); setDistance(""); setRpe(7); setNote("");
  };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!convexUser) return;
    const total = hours * 60 + mins;
    if (total < 1) return;
    setStep("scoring");
    const id = await createWorkout({
      userId: convexUser._id, activityType: activity, durationMinutes: total,
      distanceKm: distance ? parseFloat(distance) : undefined,
      rpeSelfReported: rpe, userNote: note || undefined,
      startedAt: Date.now(), source: "manual",
    });
    setWorkoutId(id as string);
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70 animate-fade-in" onClick={step === "form" ? handleClose : undefined} />
      <div className="fixed bottom-0 inset-x-0 z-50 max-w-md mx-auto animate-fade-up"
        style={{
          background: "var(--bg-surface)",
          borderRadius: "16px 16px 0 0",
          border: "1px solid var(--border)",
          borderBottom: "none",
          maxHeight: "92vh",
          overflowY: "auto",
        }}>
        {/* Drag handle */}
        <div className="flex justify-center pt-3">
          <div className="w-8 h-1 rounded-full" style={{ background: "var(--border-strong)" }} />
        </div>

        {step === "form"    && <FormStep {...{ activity, setActivity, hours, setHours, mins, setMins, distance, setDistance, rpe, setRpe, note, setNote, onSubmit: handleSubmit, onClose: handleClose }} />}
        {step === "scoring" && workoutId && <ScoringStep workoutId={workoutId} onScored={() => setStep("result")} />}
        {step === "result"  && workoutId && <ScoreReveal workoutId={workoutId as any} onClose={handleClose} />}
      </div>
    </>
  );
}

function FormStep({ activity, setActivity, hours, setHours, mins, setMins, distance, setDistance, rpe, setRpe, note, setNote, onSubmit, onClose }: any) {
  const showDist  = DISTANCE_ACTIVITIES.has(activity);
  const totalMins = hours * 60 + mins;
  const rpeLabel  = ["😴","😌","🙂","😐","🙂","😤","😤","💀","💀","🔥"][rpe - 1];

  return (
    <div className="px-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <h2 className="text-base font-bold text-[var(--text-1)]">Log Workout</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-3)]">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Activity */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider mb-2">Activity</p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {ACTIVITY_TYPES.map((t) => (
            <button key={t} onClick={() => setActivity(t)}
              className={cn("flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                activity === t
                  ? "bg-[var(--accent)] text-black"
                  : "bg-[var(--bg-raised)] text-[var(--text-2)] border border-[var(--border)] hover:border-[var(--border-strong)]"
              )}>
              <span>{getActivityEmoji(t)}</span>
              <span>{t}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider mb-2">Duration</p>
        <div className="flex gap-2">
          {[
            { val: hours, set: (v: number) => setHours(Math.max(0, Math.min(12, v))), unit: "hrs" },
            { val: mins,  set: (v: number) => setMins(Math.max(0, Math.min(59, v))),  unit: "min" },
          ].map(({ val, set, unit }) => (
            <div key={unit} className="flex-1 flex items-center gap-1 px-3 py-3 rounded-lg"
              style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
              <input type="number" value={val} min={0}
                onChange={(e) => set(parseInt(e.target.value) || 0)}
                className="flex-1 bg-transparent text-xl font-bold text-[var(--text-1)] text-center outline-none w-0" />
              <span className="text-xs text-[var(--text-3)] font-medium">{unit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Distance */}
      {showDist && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider mb-2">Distance (km) — optional</p>
          <div className="flex items-center gap-1 px-3 py-3 rounded-lg"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
            <input type="number" value={distance} step="0.1" min={0} placeholder="0.0"
              onChange={(e) => setDistance(e.target.value)}
              className="flex-1 bg-transparent text-xl font-bold text-[var(--text-1)] text-center outline-none placeholder-[var(--text-3)]" />
            <span className="text-xs text-[var(--text-3)] font-medium">km</span>
          </div>
        </div>
      )}

      {/* RPE */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider mb-1">
          Effort {rpeLabel} — {rpe}/10
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-[var(--text-3)]">Easy</span>
          <input type="range" min={1} max={10} value={rpe} onChange={(e) => setRpe(+e.target.value)}
            className="flex-1 accent-[var(--accent)]" />
          <span className="text-xs text-[var(--text-3)]">Max</span>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider mb-2">Notes — optional</p>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
          placeholder="e.g. Squat PB, felt strong..."
          className="w-full px-3 py-2.5 rounded-lg text-sm text-[var(--text-1)] placeholder-[var(--text-3)] resize-none outline-none"
          style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }} />
      </div>

      <Button onClick={onSubmit} className="w-full" size="lg" disabled={totalMins < 1}>
        Score My Workout
      </Button>
    </div>
  );
}

function ScoringStep({ workoutId, onScored }: { workoutId: string; onScored: () => void }) {
  const workout = useQuery(api.workouts.getById, { workoutId: workoutId as any });
  if (workout?.scored) setTimeout(onScored, 80);
  return (
    <div className="flex flex-col items-center gap-6 py-14 px-5">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
        <span className="text-2xl">🤖</span>
      </div>
      <div className="text-center">
        <p className="text-base font-bold text-[var(--text-1)] mb-1">Scoring your session…</p>
        <p className="text-sm text-[var(--text-3)]">AI is analysing your effort</p>
      </div>
    </div>
  );
}
