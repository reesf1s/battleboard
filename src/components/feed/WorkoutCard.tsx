"use client";
import { useState } from "react";
import { getScoreColor, formatRelativeTime, cn } from "@/lib/utils";
import { isDemoMode } from "@/lib/demo";

interface Reaction { _id: any; userId: any; emoji: "fire" | "respect" | "laugh" }

interface WorkoutCardProps {
  workout: {
    _id: any;
    userId: any;
    activityType: string;
    durationMinutes: number;
    effortScore: number;
    aiReasoning: string;
    aiSummary: string;
    createdAt: number;
    user: { name: string; avatarUrl?: string } | null;
    reactions: Reaction[];
  };
  currentUserId?: any;
}

/* Reaction config — clean SVG icons */
const REACTIONS = {
  fire: {
    label: "Fire",
    color: "var(--fire)",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
        <path d="M8 1C8 1 3 6 3 10a5 5 0 0010 0c0-2-1.5-3.5-2.5-4.5C9.5 4.5 10 3 10 3S8.5 4.5 8 5C7 4 8 1 8 1z" fill="currentColor"/>
      </svg>
    ),
  },
  respect: {
    label: "Respect",
    color: "var(--respect)",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
        <path d="M4 9V15M4 9L7 5L9 7L11 3M4 9H2M12 6V15M12 6H14L12 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  laugh: {
    label: "Haha",
    color: "var(--laugh)",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.25"/>
        <path d="M5.5 6.5V7M10.5 6.5V7M5.5 10C6.5 11.5 9.5 11.5 10.5 10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
      </svg>
    ),
  },
} as const;

export function WorkoutCard({ workout, currentUserId }: WorkoutCardProps) {
  const [showAI, setShowAI] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>(workout.reactions);
  const [bouncing, setBouncing] = useState<string | null>(null);
  const demo = isDemoMode();

  // Wire up Convex mutation for real mode
  let toggleReaction: any = null;
  if (!demo) {
    const { useMutation } = require("convex/react");
    const { api } = require("../../../convex/_generated/api");
    toggleReaction = useMutation(api.reactions.toggle);
  }

  const color = getScoreColor(workout.effortScore);
  const myReactions = new Set(
    reactions.filter((r) => r.userId === currentUserId).map((r) => r.emoji),
  );
  const counts = {
    fire: reactions.filter((r) => r.emoji === "fire").length,
    respect: reactions.filter((r) => r.emoji === "respect").length,
    laugh: reactions.filter((r) => r.emoji === "laugh").length,
  };

  const handleReact = async (emoji: "fire" | "respect" | "laugh") => {
    if (!currentUserId) return;
    setBouncing(emoji);
    setTimeout(() => setBouncing(null), 300);

    // Optimistic update
    if (myReactions.has(emoji)) {
      setReactions((r) => r.filter((x) => !(x.userId === currentUserId && x.emoji === emoji)));
    } else {
      setReactions((r) => [...r, { _id: `t-${Date.now()}` as any, userId: currentUserId, emoji }]);
    }

    // Persist to backend
    if (!demo && toggleReaction) {
      try {
        await toggleReaction({
          workoutId: workout._id,
          userId: currentUserId,
          emoji,
        });
      } catch (e) {
        // Revert optimistic update on failure
        setReactions(workout.reactions);
        console.error("Failed to toggle reaction:", e);
      }
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-0">
        <div className="flex items-center gap-3">
          {workout.user?.avatarUrl ? (
            <img src={workout.user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ background: "var(--bg-overlay)", color: "var(--text-2)" }}
            >
              {workout.user?.name?.[0] ?? "?"}
            </div>
          )}
          <div>
            <span className="text-sm font-semibold text-[var(--text-1)] block leading-tight">
              {workout.user?.name ?? "Unknown"}
            </span>
            <span className="text-[11px] text-[var(--text-3)]">
              {formatRelativeTime(workout.createdAt)}
            </span>
          </div>
        </div>
        {/* Score */}
        <div
          className="app-score text-lg font-bold px-3 py-1 rounded-lg"
          style={{ background: `${color}10`, color }}
        >
          {workout.effortScore}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pt-3 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-[var(--text-1)]">{workout.activityType}</span>
          <span className="text-xs text-[var(--text-3)]">{workout.durationMinutes}min</span>
        </div>
        <p className="text-[13px] text-[var(--text-2)] leading-relaxed">{workout.aiSummary}</p>

        {/* AI reasoning toggle */}
        {workout.aiReasoning && (
          <>
            <button
              onClick={() => setShowAI(!showAI)}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors mt-3"
              style={{ color: showAI ? "var(--accent)" : "var(--text-3)" }}
            >
              <span>Analysis</span>
              <svg
                viewBox="0 0 12 12"
                fill="none"
                className={`w-3 h-3 transition-transform duration-200 ${showAI ? "rotate-180" : ""}`}
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            {showAI && (
              <div
                className="mt-2 px-3.5 py-3 rounded-xl animate-fade-in text-[13px] text-[var(--text-2)] leading-relaxed"
                style={{ background: "var(--bg-raised)", borderLeft: `2px solid ${color}` }}
              >
                {workout.aiReasoning}
              </div>
            )}
          </>
        )}
      </div>

      {/* Reactions */}
      <div
        className="flex items-center gap-1.5 px-4 py-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        {(["fire", "respect", "laugh"] as const).map((emoji) => {
          const { icon, color: ec, label } = REACTIONS[emoji];
          const active = myReactions.has(emoji);
          const count = counts[emoji];
          return (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95",
                bouncing === emoji && "scale-110",
                active ? "bg-[var(--bg-raised)]" : "hover:bg-[var(--bg-hover)]",
              )}
              style={{ color: active ? ec : "var(--text-3)" }}
            >
              {icon}
              {count > 0 && <span className="font-semibold">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
