"use client";
import { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { isDemoMode } from "@/lib/demo";
import { ScoreReveal } from "./ScoreReveal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";

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

type Step = "form" | "scoring" | "result" | "error";

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

interface SheetProps {
  open: boolean;
  onClose: () => void;
}

export function LogWorkoutSheet({ open, onClose }: SheetProps) {
  if (isDemoMode()) return <DemoLogSheet open={open} onClose={onClose} />;
  return <RealLogSheet open={open} onClose={onClose} />;
}

function DemoLogSheet({ open, onClose }: SheetProps) {
  return <LogWorkoutSheetInner open={open} onClose={onClose} demo />;
}

function RealLogSheet({ open, onClose }: SheetProps) {
  const createWorkout = useMutation(api.workouts.create);
  const { convexUser } = useCurrentUser();

  return (
    <LogWorkoutSheetInner
      open={open}
      onClose={onClose}
      demo={false}
      createWorkout={createWorkout}
      convexUser={convexUser}
    />
  );
}

function LogWorkoutSheetInner({
  open,
  onClose,
  demo,
  createWorkout,
  convexUser,
}: {
  open: boolean;
  onClose: () => void;
  demo: boolean;
  createWorkout?: any;
  convexUser?: any;
}) {
  const [step, setStep] = useState<Step>("form");
  const [submitting, setSubmitting] = useState(false);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activity, setActivity] = useState("Gym (Strength)");
  const [hours, setHours] = useState(0);
  const [mins, setMins] = useState(45);
  const [distance, setDistance] = useState("");
  const [rpe, setRpe] = useState(7);
  const [note, setNote] = useState("");

  const reset = () => {
    setStep("form");
    setSubmitting(false);
    setWorkoutId(null);
    setError(null);
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

  const handleSubmit = useCallback(async () => {
    const total = hours * 60 + mins;
    if (total < 1 || submitting) return;
    setError(null);
    setSubmitting(true);

    if (demo) {
      setStep("scoring");
      setTimeout(() => setStep("result"), 1800);
      return;
    }

    if (!convexUser || !createWorkout) {
      setError("Not signed in. Please sign in to log workouts.");
      setSubmitting(false);
      return;
    }

    setStep("scoring");
    try {
      const id = await createWorkout({
        userId: convexUser._id,
        activityType: activity,
        durationMinutes: total,
        distanceKm: distance ? parseFloat(distance) : undefined,
        rpeSelfReported: rpe,
        userNote: note || undefined,
        startedAt: Date.now(),
        source: "manual" as const,
      });
      setWorkoutId(id as string);
    } catch (e: any) {
      console.error("Failed to create workout:", e);
      setError(e.message || "Failed to log workout. Please try again.");
      setStep("error");
    }
  }, [hours, mins, demo, convexUser, createWorkout, activity, distance, rpe, note, submitting]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/80 animate-fade-in" onClick={step === "form" || step === "error" ? handleClose : undefined} />
      <div
        className="fixed bottom-0 inset-x-0 z-50 max-w-[480px] mx-auto animate-slide-up glass-sheet"
        style={{
          borderRadius: "24px 24px 0 0",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3.5 pb-1">
          <div className="w-9 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
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
            error={error}
            submitting={submitting}
          />
        )}
        {step === "scoring" && (
          demo
            ? <ScoringSpinner />
            : workoutId
              ? <RealScoringStep workoutId={workoutId} onScored={() => setStep("result")} />
              : <ScoringSpinner />
        )}
        {step === "result" && (
          demo ? (
            <ScoreReveal workout={DEMO_SCORE_RESULT} onClose={handleClose} />
          ) : workoutId ? (
            <ScoreReveal workoutId={workoutId as any} onClose={handleClose} />
          ) : null
        )}
        {step === "error" && (
          <ErrorStep error={error} onRetry={() => { setSubmitting(false); setStep("form"); }} onClose={handleClose} />
        )}
      </div>
    </>
  );
}

function ErrorStep({ error, onRetry, onClose }: { error: string | null; onRetry: () => void; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-14 px-5">
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(248,113,113,0.06)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-destructive">
          <path d="M12 9v4m0 4h.01M12 3l9.66 16.59A1 1 0 0120.66 21H3.34a1 1 0 01-.86-1.41L12 3z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-base font-semibold text-foreground mb-1.5">Something went wrong</p>
        <p className="text-sm text-muted-foreground max-w-[260px]">{error || "We couldn't score your workout. Please try again."}</p>
      </div>
      <div className="flex gap-3 w-full">
        <Button onClick={onClose} variant="ghost" className="flex-1">Cancel</Button>
        <Button onClick={onRetry} className="flex-1">Try Again</Button>
      </div>
    </div>
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
  error,
  submitting,
}: any) {
  const showDist = DISTANCE_ACTIVITIES.has(activity);
  const totalMins = hours * 60 + mins;

  const effortLabels = ["Very easy", "Easy", "Light", "Moderate", "Somewhat hard", "Hard", "Very hard", "Intense", "Max effort", "All out"];

  return (
    <div className="px-5 pb-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between py-5">
        <h2 className="app-display text-xl font-extrabold text-foreground">Log Workout</h2>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.04] text-muted-foreground transition-colors"
          aria-label="Close">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Activity */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Activity</p>
        <div className="grid grid-cols-2 gap-1.5">
          {ACTIVITY_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setActivity(t)}
              className={cn(
                "px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all text-left",
                activity === t
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              style={
                activity === t
                  ? {
                      background: "linear-gradient(135deg, #00F0B5, #00C89D)",
                      boxShadow: "0 2px 8px rgba(0,240,181,0.2)",
                    }
                  : {
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Duration</p>
        <div className="flex gap-2">
          {[
            { val: hours, set: (v: number) => setHours(Math.max(0, Math.min(12, v))), unit: "hrs" },
            { val: mins, set: (v: number) => setMins(Math.max(0, Math.min(59, v))), unit: "min" },
          ].map(({ val, set, unit }) => (
            <div
              key={unit}
              className="flex-1 flex items-center gap-1 px-3 py-4 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <input
                type="number"
                value={val}
                min={0}
                onChange={(e) => set(parseInt(e.target.value) || 0)}
                className="flex-1 bg-transparent app-score text-3xl font-extrabold text-foreground text-center outline-none w-0"
                aria-label={unit === "hrs" ? "Hours" : "Minutes"}
              />
              <span className="text-[11px] text-muted-foreground font-semibold uppercase">{unit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Distance */}
      {showDist && (
        <div className="mb-6">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Distance (km)
          </p>
          <div
            className="flex items-center gap-1 px-3 py-4 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <input
              type="number"
              value={distance}
              step="0.1"
              min={0}
              placeholder="0.0"
              onChange={(e) => setDistance(e.target.value)}
              className="flex-1 bg-transparent app-score text-3xl font-extrabold text-foreground text-center outline-none placeholder-muted-foreground"
              aria-label="Distance in kilometres"
            />
            <span className="text-[11px] text-muted-foreground font-semibold uppercase">km</span>
          </div>
        </div>
      )}

      {/* RPE */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Effort</p>
          <Badge className="bg-primary/10 text-primary border-transparent font-bold">{rpe}/10</Badge>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={rpe}
          onChange={(e) => setRpe(+e.target.value)}
          className="w-full"
          aria-label="Rate of perceived exertion"
        />
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-muted-foreground">Easy</span>
          <span className="text-[10px] text-foreground font-semibold">{effortLabels[rpe - 1]}</span>
          <span className="text-[10px] text-muted-foreground">Max</span>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-7">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Notes
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Anything notable — PBs, how you felt..."
          className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-muted-foreground resize-none outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive mb-4 text-center">{error}</p>
      )}

      <Button onClick={onSubmit} className="w-full btn-gradient text-primary-foreground" size="lg" disabled={totalMins < 1}>
        {submitting ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
            Scoring...
          </span>
        ) : (
          "Score My Workout"
        )}
      </Button>
    </div>
  );
}

function ScoringSpinner() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 px-5">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
        />
        <Badge className="bg-primary/10 text-primary border-transparent text-[10px] font-bold">
          AI
        </Badge>
      </div>
      <div className="text-center">
        <p className="text-base font-semibold text-foreground mb-1.5">Scoring your session</p>
        <p className="text-sm text-muted-foreground">Analysing effort, duration, and context</p>
      </div>
    </div>
  );
}

function RealScoringStep({ workoutId, onScored }: { workoutId: string; onScored: () => void }) {
  const workout = useQuery(api.workouts.getById, { workoutId: workoutId as any });
  if (workout?.scored) setTimeout(onScored, 80);
  return <ScoringSpinner />;
}
