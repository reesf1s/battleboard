"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { getActivityEmoji, getScoreColor, getScoreTier, formatRelativeTime, cn } from "@/lib/utils";

interface Reaction { _id: Id<"reactions">; userId: Id<"users">; emoji: "fire" | "respect" | "laugh" }

interface WorkoutCardProps {
  workout: {
    _id: Id<"workouts">;
    userId: Id<"users">;
    activityType: string;
    durationMinutes: number;
    effortScore: number;
    aiReasoning: string;
    aiSummary: string;
    createdAt: number;
    user: { name: string; avatarUrl?: string } | null;
    reactions: Reaction[];
  };
  currentUserId?: Id<"users">;
}

const REACTIONS = {
  fire:    { icon: "🔥", label: "fire",    color: "var(--fire)" },
  respect: { icon: "💪", label: "respect", color: "var(--respect)" },
  laugh:   { icon: "😂", label: "laugh",   color: "var(--laugh)" },
} as const;

export function WorkoutCard({ workout, currentUserId }: WorkoutCardProps) {
  const [showAI, setShowAI] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>(workout.reactions);
  const [bouncing, setBouncing] = useState<string | null>(null);
  const toggleReaction = useMutation(api.reactions.toggle);

  const color = getScoreColor(workout.effortScore);
  const myReactions = new Set(reactions.filter((r) => r.userId === currentUserId).map((r) => r.emoji));

  const counts = {
    fire:    reactions.filter((r) => r.emoji === "fire").length,
    respect: reactions.filter((r) => r.emoji === "respect").length,
    laugh:   reactions.filter((r) => r.emoji === "laugh").length,
  };

  const handleReact = async (emoji: "fire" | "respect" | "laugh") => {
    if (!currentUserId) return;
    setBouncing(emoji);
    setTimeout(() => setBouncing(null), 300);
    // optimistic
    if (myReactions.has(emoji)) {
      setReactions((r) => r.filter((x) => !(x.userId === currentUserId && x.emoji === emoji)));
    } else {
      setReactions((r) => [...r, { _id: `t-${Date.now()}` as any, userId: currentUserId, emoji }]);
    }
    await toggleReaction({ workoutId: workout._id, userId: currentUserId, emoji });
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-0">
        <div className="flex items-center gap-2.5">
          {workout.user?.avatarUrl ? (
            <img src={workout.user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ background: "var(--bg-overlay)", color: "var(--text-2)" }}>
              {workout.user?.name?.[0] ?? "?"}
            </div>
          )}
          <span className="text-sm font-semibold text-[var(--text-1)]">{workout.user?.name ?? "—"}</span>
          <span className="text-xs text-[var(--text-3)]">{formatRelativeTime(workout.createdAt)}</span>
        </div>
        {/* Score pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{ background: `${color}14`, border: `1px solid ${color}25` }}>
          <span className="text-sm font-black" style={{ color }}>{workout.effortScore}</span>
          <span className="text-[10px] text-[var(--text-3)] font-medium">pts</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-3.5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-base">{getActivityEmoji(workout.activityType)}</span>
          <span className="text-sm font-semibold text-[var(--text-1)]">{workout.activityType}</span>
          <span className="text-xs text-[var(--text-3)]">· {workout.durationMinutes}min</span>
        </div>
        <p className="text-xs text-[var(--text-2)] leading-relaxed mb-2.5">{workout.aiSummary}</p>

        {/* AI reasoning toggle */}
        {workout.aiReasoning && (
          <button onClick={() => setShowAI(!showAI)}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors mb-1"
            style={{ color: showAI ? "var(--accent)" : "var(--text-3)" }}>
            <span>AI analysis</span>
            <svg viewBox="0 0 12 12" fill="none" className={`w-3 h-3 transition-transform ${showAI ? "rotate-180" : ""}`}>
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}
        {showAI && (
          <p className="text-xs text-[var(--text-2)] leading-relaxed mt-1.5 px-3 py-2.5 rounded-lg animate-fade-in"
            style={{ background: "var(--bg-raised)", borderLeft: "2px solid var(--accent)" }}>
            {workout.aiReasoning}
          </p>
        )}
      </div>

      {/* Reactions */}
      <div className="flex items-center gap-1 px-3 pb-3" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="pt-2.5 flex items-center gap-1">
          {(["fire", "respect", "laugh"] as const).map((emoji) => {
            const { icon, color: ec } = REACTIONS[emoji];
            const active = myReactions.has(emoji);
            const count  = counts[emoji];
            return (
              <button key={emoji} onClick={() => handleReact(emoji)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm transition-all active:scale-95",
                  bouncing === emoji && "scale-110",
                  active ? "bg-[var(--bg-raised)]" : "hover:bg-[var(--bg-hover)]"
                )}>
                <span className="leading-none">{icon}</span>
                {count > 0 && (
                  <span className="text-xs font-semibold" style={{ color: active ? ec : "var(--text-3)" }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
