"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  getActivityEmoji,
  getScoreColor,
  getScoreTier,
  formatRelativeTime,
  cn,
} from "@/lib/utils";

interface Reaction {
  _id: Id<"reactions">;
  userId: Id<"users">;
  emoji: "fire" | "respect" | "laugh";
}

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

const REACTION_EMOJIS = {
  fire: { emoji: "🔥", color: "var(--fire)" },
  respect: { emoji: "💪", color: "var(--respect)" },
  laugh: { emoji: "😂", color: "var(--laugh)" },
};

export function WorkoutCard({ workout, currentUserId }: WorkoutCardProps) {
  const [showReasoning, setShowReasoning] = useState(false);
  const [localReactions, setLocalReactions] = useState<Reaction[]>(
    workout.reactions
  );
  const [animating, setAnimating] = useState<string | null>(null);

  const toggleReaction = useMutation(api.reactions.toggle);

  const reactionCounts = {
    fire: localReactions.filter((r) => r.emoji === "fire").length,
    respect: localReactions.filter((r) => r.emoji === "respect").length,
    laugh: localReactions.filter((r) => r.emoji === "laugh").length,
  };

  const myReactions = new Set(
    localReactions
      .filter((r) => r.userId === currentUserId)
      .map((r) => r.emoji)
  );

  const handleReaction = async (emoji: "fire" | "respect" | "laugh") => {
    if (!currentUserId) return;

    setAnimating(emoji);
    setTimeout(() => setAnimating(null), 300);

    // Optimistic update
    const hasReaction = myReactions.has(emoji);
    if (hasReaction) {
      setLocalReactions((prev) =>
        prev.filter((r) => !(r.userId === currentUserId && r.emoji === emoji))
      );
    } else {
      setLocalReactions((prev) => [
        ...prev,
        {
          _id: `temp-${Date.now()}` as Id<"reactions">,
          userId: currentUserId,
          emoji,
        },
      ]);
    }

    await toggleReaction({
      workoutId: workout._id,
      userId: currentUserId,
      emoji,
    });
  };

  const color = getScoreColor(workout.effortScore);
  const tier = getScoreTier(workout.effortScore);
  const activityEmoji = getActivityEmoji(workout.activityType);

  return (
    <div className="glass-card p-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {workout.user?.avatarUrl ? (
            <img
              src={workout.user.avatarUrl}
              alt={workout.user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "var(--bg-elevated)" }}
            >
              {workout.user?.name?.[0] || "?"}
            </div>
          )}
          <div>
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {workout.user?.name || "Unknown"}
            </span>
            <p className="text-xs text-[var(--text-tertiary)]">
              {formatRelativeTime(workout.createdAt)}
            </p>
          </div>
        </div>

        {/* Score badge */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            background: `${color}15`,
            border: `1px solid ${color}30`,
          }}
        >
          <span className="text-lg font-black" style={{ color }}>
            {workout.effortScore}
          </span>
          <span className="text-xs text-[var(--text-tertiary)]">pts</span>
        </div>
      </div>

      {/* Activity */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{activityEmoji}</span>
        <div>
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {workout.activityType}
          </span>
          <span className="text-xs text-[var(--text-tertiary)] ml-2">
            {workout.durationMinutes}min
          </span>
        </div>
      </div>

      {/* AI Summary */}
      <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
        {workout.aiSummary}
      </p>

      {/* AI Reasoning expandable */}
      {workout.aiReasoning && (
        <button
          onClick={() => setShowReasoning(!showReasoning)}
          className="text-xs text-[var(--accent-primary)] font-medium mb-2 flex items-center gap-1"
        >
          <span>🤖 AI analysis</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={`w-3 h-3 transition-transform ${showReasoning ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
      {showReasoning && (
        <div
          className="mb-3 p-3 rounded-xl text-xs text-[var(--text-secondary)] leading-relaxed animate-fade-in"
          style={{ background: "rgba(50,215,75,0.06)", border: "1px solid rgba(50,215,75,0.1)" }}
        >
          {workout.aiReasoning}
        </div>
      )}

      {/* Reactions */}
      <div
        className="flex items-center gap-3 pt-3 border-t"
        style={{ borderColor: "var(--glass-border)" }}
      >
        {(["fire", "respect", "laugh"] as const).map((emoji) => {
          const { emoji: icon, color: emojiColor } = REACTION_EMOJIS[emoji];
          const active = myReactions.has(emoji);
          const count = reactionCounts[emoji];

          return (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-sm transition-all active:scale-90",
                animating === emoji && "animate-bounce-emoji",
                active ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              <span className={animating === emoji ? "animate-bounce-emoji" : ""}>
                {icon}
              </span>
              {count > 0 && (
                <span
                  className="text-xs font-medium"
                  style={{ color: active ? emojiColor : "var(--text-tertiary)" }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
