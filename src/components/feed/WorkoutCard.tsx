"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getScoreColor, formatRelativeTime, cn } from "@/lib/utils";

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
  toggleReaction?: (args: { workoutId: any; userId: any; emoji: string }) => Promise<void>;
}

const REACTIONS = {
  fire: {
    label: "Fire",
    color: "#FF6347",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
        <path d="M8 1C8 1 3 6 3 10a5 5 0 0010 0c0-2-1.5-3.5-2.5-4.5C9.5 4.5 10 3 10 3S8.5 4.5 8 5C7 4 8 1 8 1z" fill="currentColor"/>
      </svg>
    ),
  },
  respect: {
    label: "Respect",
    color: "#A78BFA",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
        <path d="M4 9V15M4 9L7 5L9 7L11 3M4 9H2M12 6V15M12 6H14L12 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  laugh: {
    label: "Haha",
    color: "#FFD700",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.25"/>
        <path d="M5.5 6.5V7M10.5 6.5V7M5.5 10C6.5 11.5 9.5 11.5 10.5 10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
      </svg>
    ),
  },
} as const;

export function WorkoutCard({ workout, currentUserId, toggleReaction }: WorkoutCardProps) {
  const [showAI, setShowAI] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>(workout.reactions);
  const [bouncing, setBouncing] = useState<string | null>(null);

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

    if (myReactions.has(emoji)) {
      setReactions((r) => r.filter((x) => !(x.userId === currentUserId && x.emoji === emoji)));
    } else {
      setReactions((r) => [...r, { _id: `t-${Date.now()}` as any, userId: currentUserId, emoji }]);
    }

    if (toggleReaction) {
      try {
        await toggleReaction({ workoutId: workout._id, userId: currentUserId, emoji });
      } catch (e) {
        setReactions(workout.reactions);
        console.error("Failed to toggle reaction:", e);
      }
    }
  };

  return (
    <Card className="gap-0 py-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-0">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="size-10 rounded-xl after:rounded-xl">
            {workout.user?.avatarUrl && (
              <AvatarImage src={workout.user.avatarUrl} alt={workout.user?.name || ""} className="rounded-xl" />
            )}
            <AvatarFallback
              className="rounded-xl text-xs font-bold"
              style={{
                background: "linear-gradient(145deg, rgba(40,40,46,1) 0%, rgba(28,28,33,1) 100%)",
                color: "var(--muted-foreground)",
              }}
            >
              {workout.user?.name?.[0] ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <span className="text-sm font-bold text-foreground block leading-tight truncate">
              {workout.user?.name ?? "Unknown"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {formatRelativeTime(workout.createdAt)}
            </span>
          </div>
        </div>
        <div
          className="flex items-center px-3 py-1.5 rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${color}18, ${color}08)`,
            border: `1px solid ${color}15`,
          }}
        >
          <span className="app-score text-base font-extrabold" style={{ color }}>
            {workout.effortScore}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-sm font-bold text-foreground">{workout.activityType}</span>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
            style={{ background: "rgba(255,255,255,0.04)", color: "var(--muted-foreground)" }}
          >
            {workout.durationMinutes}min
          </span>
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed italic">{workout.aiSummary}</p>

        {workout.aiReasoning && (
          <>
            <button
              onClick={() => setShowAI(!showAI)}
              className="flex items-center gap-1.5 text-xs font-bold transition-colors mt-3"
              style={{ color: showAI ? "var(--primary)" : "var(--text-3)" }}
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
                className="mt-2.5 px-3.5 py-3 rounded-lg animate-fade-in text-[13px] text-muted-foreground leading-relaxed"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {workout.aiReasoning}
              </div>
            )}
          </>
        )}
      </div>

      {/* Reactions */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-1.5 px-4 py-2.5">
          {(["fire", "respect", "laugh"] as const).map((emoji) => {
            const { icon, color: ec, label } = REACTIONS[emoji];
            const active = myReactions.has(emoji);
            const count = counts[emoji];
            return (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                aria-label={`${label} reaction${count > 0 ? ` (${count})` : ""}`}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95",
                  bouncing === emoji && "scale-110",
                )}
                style={{
                  color: active ? ec : "var(--text-3)",
                  background: active ? `${ec}12` : "transparent",
                  border: active ? `1px solid ${ec}15` : "1px solid transparent",
                }}
              >
                {icon}
                {count > 0 && <span className="font-bold">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
