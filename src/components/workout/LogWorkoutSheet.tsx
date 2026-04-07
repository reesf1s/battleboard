"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ScoreReveal } from "./ScoreReveal";
import { cn, getActivityEmoji } from "@/lib/utils";
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

const DISTANCE_ACTIVITIES = new Set([
  "Running",
  "Walking",
  "Cycling",
  "Swimming",
  "Hiking",
  "Rowing",
]);

const RPE_LABELS = ["😴", "😌", "🙂", "😐", "😤", "😤", "😤", "💀", "💀", "🔥"];

interface LogWorkoutSheetProps {
  open: boolean;
  onClose: () => void;
}

type Step = "form" | "scoring" | "result";

export function LogWorkoutSheet({ open, onClose }: LogWorkoutSheetProps) {
  const { convexUser } = useCurrentUser();
  const createWorkout = useMutation(api.workouts.create);

  const [step, setStep] = useState<Step>("form");
  const [workoutId, setWorkoutId] = useState<string | null>(null);

  // Form state
  const [activityType, setActivityType] = useState("Gym (Strength)");
  const [durationHours, setDurationHours] = useState(0);
  const [durationMins, setDurationMins] = useState(45);
  const [distance, setDistance] = useState("");
  const [rpe, setRpe] = useState(7);
  const [note, setNote] = useState("");

  const handleClose = () => {
    setStep("form");
    setWorkoutId(null);
    setActivityType("Gym (Strength)");
    setDurationHours(0);
    setDurationMins(45);
    setDistance("");
    setRpe(7);
    setNote("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!convexUser) return;

    const totalMinutes = durationHours * 60 + durationMins;
    if (totalMinutes < 1) return;

    setStep("scoring");

    const id = await createWorkout({
      userId: convexUser._id,
      activityType,
      durationMinutes: totalMinutes,
      distanceKm: distance ? parseFloat(distance) : undefined,
      rpeSelfReported: rpe,
      userNote: note || undefined,
      startedAt: Date.now(),
      source: "manual",
    });

    setWorkoutId(id as string);
  };

  const handleScored = () => {
    setStep("result");
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm animate-fade-in"
        onClick={step === "form" ? handleClose : undefined}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto animate-slide-up"
        style={{
          background: "var(--bg-secondary)",
          borderRadius: "24px 24px 0 0",
          border: "1px solid var(--glass-border)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "var(--text-tertiary)" }}
          />
        </div>

        {step === "form" && (
          <FormStep
            activityType={activityType}
            setActivityType={setActivityType}
            durationHours={durationHours}
            setDurationHours={setDurationHours}
            durationMins={durationMins}
            setDurationMins={setDurationMins}
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

        {step === "scoring" && workoutId && (
          <ScoringStep workoutId={workoutId} onScored={handleScored} />
        )}

        {step === "result" && workoutId && (
          <ScoreReveal workoutId={workoutId as any} onClose={handleClose} />
        )}
      </div>
    </>
  );
}

interface FormStepProps {
  activityType: string;
  setActivityType: (v: string) => void;
  durationHours: number;
  setDurationHours: (v: number) => void;
  durationMins: number;
  setDurationMins: (v: number) => void;
  distance: string;
  setDistance: (v: string) => void;
  rpe: number;
  setRpe: (v: number) => void;
  note: string;
  setNote: (v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

function FormStep({
  activityType,
  setActivityType,
  durationHours,
  setDurationHours,
  durationMins,
  setDurationMins,
  distance,
  setDistance,
  rpe,
  setRpe,
  note,
  setNote,
  onSubmit,
  onClose,
}: FormStepProps) {
  const showDistance = DISTANCE_ACTIVITIES.has(activityType);
  const totalMins = durationHours * 60 + durationMins;

  return (
    <div className="px-5 pb-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Log Workout</h2>
        <button onClick={onClose} className="text-[var(--text-tertiary)] p-1">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Activity type chips */}
      <div className="mb-5">
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">
          Activity
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {ACTIVITY_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setActivityType(type)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all",
                activityType === type
                  ? "bg-[var(--accent-primary)] text-black"
                  : "glass-card-sm text-[var(--text-secondary)]"
              )}
            >
              <span>{getActivityEmoji(type)}</span>
              <span>{type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="mb-5">
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">
          Duration
        </label>
        <div className="flex gap-3">
          <div className="flex-1 glass-card-sm p-3 flex items-center gap-2">
            <input
              type="number"
              value={durationHours}
              onChange={(e) => setDurationHours(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-transparent text-[var(--text-primary)] text-center text-xl font-bold outline-none"
              min={0}
              max={12}
            />
            <span className="text-[var(--text-tertiary)] text-sm">h</span>
          </div>
          <div className="flex-1 glass-card-sm p-3 flex items-center gap-2">
            <input
              type="number"
              value={durationMins}
              onChange={(e) =>
                setDurationMins(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))
              }
              className="w-full bg-transparent text-[var(--text-primary)] text-center text-xl font-bold outline-none"
              min={0}
              max={59}
            />
            <span className="text-[var(--text-tertiary)] text-sm">min</span>
          </div>
        </div>
      </div>

      {/* Distance (conditional) */}
      {showDistance && (
        <div className="mb-5">
          <label className="text-xs font-medium text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">
            Distance (km) — optional
          </label>
          <div className="glass-card-sm p-3 flex items-center gap-2">
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="0.0"
              step="0.1"
              min={0}
              className="w-full bg-transparent text-[var(--text-primary)] text-center text-xl font-bold outline-none placeholder-[var(--text-tertiary)]"
            />
            <span className="text-[var(--text-tertiary)] text-sm">km</span>
          </div>
        </div>
      )}

      {/* RPE Slider */}
      <div className="mb-5">
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">
          How hard did it feel? {RPE_LABELS[rpe - 1]} ({rpe}/10)
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={rpe}
          onChange={(e) => setRpe(parseInt(e.target.value))}
          className="w-full accent-[var(--accent-primary)]"
        />
        <div className="flex justify-between text-xs text-[var(--text-tertiary)] mt-1">
          <span>Easy</span>
          <span>Max effort</span>
        </div>
      </div>

      {/* Note */}
      <div className="mb-6">
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">
          Notes — PBs, details (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Hit a squat PB, felt strong..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none resize-none"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        />
      </div>

      <Button
        onClick={onSubmit}
        className="w-full"
        size="lg"
        disabled={totalMins < 1}
      >
        Score My Workout →
      </Button>
    </div>
  );
}

function ScoringStep({
  workoutId,
  onScored,
}: {
  workoutId: string;
  onScored: () => void;
}) {
  const workout = useQuery(api.workouts.getById, {
    workoutId: workoutId as any,
  });

  if (workout?.scored) {
    setTimeout(onScored, 100);
  }

  return (
    <div className="px-5 py-12 flex flex-col items-center gap-6">
      <div className="relative">
        <div
          className="w-20 h-20 rounded-full border-4 border-t-[var(--accent-primary)] border-r-[var(--accent-primary)] border-b-transparent border-l-transparent animate-spin"
        />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          🤖
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
          Scoring your workout...
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          The AI is analysing your effort
        </p>
      </div>
    </div>
  );
}

// Import useQuery at top level
import { useQuery } from "convex/react";
