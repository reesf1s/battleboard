"use client";
import { useState } from "react";
import { isDemoMode } from "@/lib/demo";
import { ScoreReveal } from "./ScoreReveal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const ACTIVITY_TYPES = [
  "Gym (Strength)",
  "Gym (Cardio)",
  "Running",
  "Walking",
  "Cycling",
  "Swimming",
  "Boxing/MMA",
  "Yoga/Pilates",
  "HIIT/CrossFit",
  "Team Sports",
  "Climbing",
  "Snowboarding/Skiing",
  "Dance",
  "Hiking",
  "Rowing",
  "Other",
];
const DISTANCE_ACTIVITIES = new Set(["Running", "Walking", "Cycling", "Swimming", "Hiking", "Rowing"]);

type Step = "form" | "scoring" | "result";

// Demo score result
const DEMO_SCORE_RESULT = {
  scored: true,
  effortScore: 78,
  aiSummary: "52min gym session — 4 compound lifts — solid progressive overload",
  aiReasoning:
    "Good duration for a strength session with compound movements. The RPE of 7 suggests you pushed hard without overreaching. Consistent training pattern this week earns a small bonus.",
  intensityScore: 7.5,
  durationScore: 7.0,
  personalEffortScore: 7.8,
  consistencyBonus: 1.2,
};

export function LogWorkoutSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const demo = isDemoMode();

  const [step, setStep] = useState<Step>("form");
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [activity, setActivity] = useState("Gym (Strength)");
  const [hours, setHours] = useState(0);
  const [mins, setMins] = useState(45);
  const [distance, setDistance] = useState("");
  const [rpe, setRpe] = useState(7);
  const [note, setNote] = useState("");

  const reset = () => {
    setStep("form");
    setWorkoutId(null);
    setActivity("Gym (Strength)");
    setHours(0);
    setMins(45);
    setDistance("");
    setRpe(7);
    setNote("");
  };
  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    const total = hours * 60 + mins;
    if (total < 1) return;

    if (demo) {
      setStep("scoring");
      // Simulate scoring delay
      setTimeout(() => setStep("result"), 1800);
      return;
    }

    // Real mode — use Convex
    const { useCurrentUser } = await import("@/hooks/useCurrentUser");
    // Actually, we need the convexUser from the component tree
    // This is handled by the real mode page component
    setStep("scoring");
  };

  const handleRealSubmit = async (createWorkout: any, userId: any) => {
    const total = hours * 60 + mins;
    if (total < 1) return;
    setStep("scoring");
    const id = await createWorkout({
      userId,
      activityType: activity,
      durationMinutes: total,
      distanceKm: distance ? parseFloat(distance) : undefined,
      rpeSelfReported: rpe,
      userNote: note || undefined,
      startedAt: Date.now(),
      source: "manual",
    });
    setWorkoutId(id as string);
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70 animate-fade-in" onClick={step === "form" ? handleClose : undefined} />
      <div
        className="fixed bottom-0 inset-x-0 z-50 max-w-md mx-auto animate-fade-up"
        style={{
          background: "var(--bg-surface)",
          borderRadius: "20px 20px 0 0",
          border: "1px solid var(--border)",
          borderBottom: "none",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3">
          <div className="w-9 h-1 rounded-full" style={{ background: "var(--border-strong)" }} />
        </div>

        {step === "form" && (
          <FormStep
            activity={activity}
            setActivity={setActivity}
            hours={hours}
            setHours={setHours}
            mins={mins}
            setMins={setMins}
            distance={distance}
            setDistance={setDistance}
            rpe={rpe}
            setRpe={setRpe}
            note={note}
            setNote={setNote}
            onSubmit={handleSubmit}
            onClose={handleClose}
          />
        )}
        {step === "scoring" && <ScoringStep workoutId={workoutId} onScored={() => setStep("result")} demo={demo} />}
        {step === "result" && (
          demo ? (
            <ScoreReveal workout={DEMO_SCORE_RESULT} onClose={handleClose} />
          ) : workoutId ? (
            <ScoreReveal workoutId={workoutId as any} onClose={handleClose} />
          ) : null
        )}
      </div>
    </>
  );
}

function FormStep({
  activity,
  setActivity,
  hours,
  setHours,
  mins,
  setMins,
  distance,
  setDistance,
  rpe,
  setRpe,
  note,
  setNote,
  onSubmit,
  onClose,
}: any) {
  const showDist = DISTANCE_ACTIVITIES.has(activity);
  const totalMins = hours * 60 + mins;

  const effortLabels = ["Very easy", "Easy", "Light", "Moderate", "Somewhat hard", "Hard", "Very hard", "Intense", "Max effort", "All out"];

  return (
    <div className="px-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between py-5">
        <h2 className="app-display text-lg font-bold text-[var(--text-1)]">Log Workout</h2>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-3)] transition-colors">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Activity — 2 column grid */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-widest mb-3">Activity</p>
        <div className="grid grid-cols-2 gap-1.5">
          {ACTIVITY_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setActivity(t)}
              className={cn(
                "px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left",
                activity === t
                  ? "text-black"
                  : "text-[var(--text-2)] hover:bg-[var(--bg-hover)]",
              )}
              style={
                activity === t
                  ? { background: "var(--accent)" }
                  : { background: "var(--bg-raised)", border: "1px solid var(--border)" }
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-widest mb-3">Duration</p>
        <div className="flex gap-2">
          {[
            { val: hours, set: (v: number) => setHours(Math.max(0, Math.min(12, v))), unit: "hrs" },
            { val: mins, set: (v: number) => setMins(Math.max(0, Math.min(59, v))), unit: "min" },
          ].map(({ val, set, unit }) => (
            <div
              key={unit}
              className="flex-1 flex items-center gap-1 px-3 py-3.5 rounded-xl"
              style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
            >
              <input
                type="number"
                value={val}
                min={0}
                onChange={(e) => set(parseInt(e.target.value) || 0)}
                className="flex-1 bg-transparent app-score text-2xl font-bold text-[var(--text-1)] text-center outline-none w-0"
              />
              <span className="text-xs text-[var(--text-3)] font-medium">{unit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Distance */}
      {showDist && (
        <div className="mb-6">
          <p className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-widest mb-3">
            Distance (km)
          </p>
          <div
            className="flex items-center gap-1 px-3 py-3.5 rounded-xl"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
          >
            <input
              type="number"
              value={distance}
              step="0.1"
              min={0}
              placeholder="0.0"
              onChange={(e) => setDistance(e.target.value)}
              className="flex-1 bg-transparent app-score text-2xl font-bold text-[var(--text-1)] text-center outline-none placeholder-[var(--text-3)]"
            />
            <span className="text-xs text-[var(--text-3)] font-medium">km</span>
          </div>
        </div>
      )}

      {/* RPE */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-widest">Effort</p>
          <span className="text-sm font-semibold text-[var(--text-1)]">{rpe}/10</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={rpe}
          onChange={(e) => setRpe(+e.target.value)}
          className="w-full"
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-[var(--text-3)]">Easy</span>
          <span className="text-[10px] text-[var(--text-2)] font-medium">{effortLabels[rpe - 1]}</span>
          <span className="text-[10px] text-[var(--text-3)]">Max</span>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-7">
        <p className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-widest mb-3">
          Notes
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Anything notable — PBs, how you felt..."
          className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-1)] placeholder-[var(--text-3)] resize-none outline-none focus:ring-1 focus:ring-[var(--accent)]"
          style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
        />
      </div>

      <Button onClick={onSubmit} className="w-full" size="lg" disabled={totalMins < 1}>
        Score My Workout
      </Button>
    </div>
  );
}

function ScoringStep({
  workoutId,
  onScored,
  demo,
}: {
  workoutId: string | null;
  onScored: () => void;
  demo: boolean;
}) {
  if (!demo && workoutId) {
    const { useQuery } = require("convex/react");
    const { api } = require("../../../convex/_generated/api");
    const workout = useQuery(api.workouts.getById, { workoutId: workoutId as any });
    if (workout?.scored) setTimeout(onScored, 80);
  }

  return (
    <div className="flex flex-col items-center gap-6 py-16 px-5">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
        />
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold"
          style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
        >
          AI
        </div>
      </div>
      <div className="text-center">
        <p className="text-base font-semibold text-[var(--text-1)] mb-1.5">Scoring your session</p>
        <p className="text-sm text-[var(--text-3)]">Analysing effort, duration, and context</p>
      </div>
    </div>
  );
}
