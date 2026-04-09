"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getScoreColor, cn } from "@/lib/utils";

interface LeaderboardEntry {
  _id: any;
  userId: any;
  totalScore: number;
  workoutCount: number;
  topWorkoutScore: number;
  topWorkoutSummary: string;
  user: { name: string; avatarUrl?: string } | null;
  rank: number;
}

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  rank: number;
  topScore: number;
  trend: number | null;
  isCurrentUser: boolean;
  weekId: string;
}

function RankBadge({ rank, color }: { rank: number; color: string }) {
  const podiumColors: Record<number, string> = {
    1: "#FFD700",
    2: "#A1A1AA",
    3: "#CD7F32",
  };
  const badgeColor = podiumColors[rank] ?? color;
  const isPodium = rank <= 3;

  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0 relative"
      style={{
        background: isPodium
          ? `linear-gradient(145deg, ${badgeColor}22, ${badgeColor}0A)`
          : `${badgeColor}10`,
        color: badgeColor,
        border: isPodium ? `1px solid ${badgeColor}20` : "1px solid transparent",
        boxShadow: isPodium ? `0 0 8px ${badgeColor}10` : "none",
      }}
    >
      {rank}
    </div>
  );
}

export function LeaderboardCard({ entry, rank, topScore, trend, isCurrentUser }: LeaderboardCardProps) {
  const [expanded, setExpanded] = useState(false);
  const color = getScoreColor(entry.totalScore);
  const pct = topScore > 0 ? (entry.totalScore / topScore) * 100 : 0;

  return (
    <Card
      className={cn(
        "gap-0 py-0 cursor-pointer transition-all duration-200",
        "hover:border-white/[0.1] active:scale-[0.99]",
        isCurrentUser && "border-primary/10",
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <RankBadge rank={rank} color={color} />

        <div className="relative flex-shrink-0">
          <Avatar className="size-10 rounded-xl after:rounded-xl">
            {entry.user?.avatarUrl && (
              <AvatarImage src={entry.user.avatarUrl} alt={entry.user?.name || ""} className="rounded-xl" />
            )}
            <AvatarFallback
              className="rounded-xl text-sm font-bold"
              style={{
                background: "linear-gradient(145deg, rgba(40,40,46,1) 0%, rgba(28,28,33,1) 100%)",
                color: "var(--muted-foreground)",
              }}
            >
              {entry.user?.name?.[0] ?? "?"}
            </AvatarFallback>
          </Avatar>
          {isCurrentUser && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
              style={{
                background: "var(--primary)",
                borderColor: "var(--background)",
                boxShadow: "0 0 6px rgba(0,240,181,0.3)",
              }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[15px] font-bold text-foreground truncate leading-tight">
              {entry.user?.name ?? "Unknown"}
            </span>
            {isCurrentUser && (
              <Badge className="text-[9px] px-1.5 h-4 bg-primary/10 text-primary border-transparent uppercase tracking-wider font-bold">
                you
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{entry.workoutCount} session{entry.workoutCount !== 1 ? "s" : ""}</span>
            {entry.topWorkoutScore > 0 && (
              <>
                <span className="opacity-40">·</span>
                <span>Best {entry.topWorkoutScore}</span>
              </>
            )}
          </div>
          <div className="mt-2.5 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${pct}%`,
                background: isCurrentUser
                  ? "linear-gradient(90deg, #00F0B5, #00D4A0)"
                  : `linear-gradient(90deg, ${color}, ${color}66)`,
                boxShadow: isCurrentUser ? "0 0 8px rgba(0,240,181,0.2)" : "none",
              }}
            />
          </div>
        </div>

        <div className="flex flex-col items-end flex-shrink-0 ml-3">
          <span className="app-score text-xl font-extrabold leading-none" style={{ color }}>
            {entry.totalScore}
          </span>
          {trend !== null && trend !== 0 && (
            <span
              className={cn(
                "text-[10px] font-bold mt-1.5 flex items-center gap-0.5",
                trend > 0 ? "text-[#34D399]" : "text-[#F87171]",
              )}
            >
              {trend > 0 ? (
                <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                  <path d="M5 2L8 6H2L5 2Z" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                  <path d="M5 8L2 4H8L5 8Z" fill="currentColor" />
                </svg>
              )}
              {trend > 0 ? `+${trend}` : trend}
            </span>
          )}
        </div>
      </div>

      {expanded && entry.topWorkoutSummary && (
        <div className="px-4 pb-3.5 animate-fade-in">
          <div
            className="pt-3 ml-11"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p className="text-xs text-muted-foreground leading-relaxed">
              {entry.topWorkoutSummary}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
