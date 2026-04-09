"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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

const PODIUM: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: "rgba(255,215,0,0.12)", text: "#FFD700", label: "1st" },
  2: { bg: "rgba(192,192,192,0.10)", text: "#A1A1AA", label: "2nd" },
  3: { bg: "rgba(205,127,50,0.10)", text: "#CD7F32", label: "3rd" },
};

function RankBadge({ rank }: { rank: number }) {
  const podium = PODIUM[rank];

  if (podium) {
    return (
      <div
        className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
        style={{ background: podium.bg }}
      >
        <span className="app-score text-[13px] font-extrabold" style={{ color: podium.text }}>
          {rank}
        </span>
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 bg-white/[0.04]">
      <span className="app-score text-[13px] font-bold text-[#555]">{rank}</span>
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
        "gap-0 py-0 cursor-pointer transition-all duration-150",
        isCurrentUser && "ring-1 ring-primary/20",
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3 px-3.5 py-3">
        <RankBadge rank={rank} />

        <div className="relative flex-shrink-0">
          <Avatar className="size-10 rounded-[10px] after:rounded-[10px]">
            {entry.user?.avatarUrl && (
              <AvatarImage src={entry.user.avatarUrl} alt={entry.user?.name || ""} className="rounded-[10px]" />
            )}
            <AvatarFallback className="rounded-[10px] text-sm font-bold bg-[#1E1E23] text-[#666]">
              {entry.user?.name?.[0] ?? "?"}
            </AvatarFallback>
          </Avatar>
          {isCurrentUser && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-[2.5px]"
              style={{ background: "#00F0B5", borderColor: "#161618" }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[14px] font-semibold text-foreground truncate leading-tight">
              {entry.user?.name ?? "Unknown"}
            </span>
            {isCurrentUser && (
              <span className="text-[9px] px-1.5 py-[2px] rounded-md bg-primary/12 text-primary uppercase tracking-wider font-bold">
                you
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>{entry.workoutCount} session{entry.workoutCount !== 1 ? "s" : ""}</span>
            {entry.topWorkoutScore > 0 && (
              <>
                <span className="opacity-30">·</span>
                <span>Best {entry.topWorkoutScore}</span>
              </>
            )}
          </div>
          <div className="mt-2 h-1.5 rounded-full overflow-hidden bg-white/[0.05]">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${pct}%`,
                background: color,
                opacity: isCurrentUser ? 1 : 0.6,
              }}
            />
          </div>
        </div>

        <div className="flex flex-col items-end flex-shrink-0 ml-3">
          <span className="app-score text-[22px] font-black leading-none" style={{ color }}>
            {entry.totalScore}
          </span>
          {trend !== null && trend !== 0 && (
            <span
              className={cn(
                "text-[10px] font-bold mt-1 flex items-center gap-0.5",
                trend > 0 ? "text-[#34D399]" : "text-[#F87171]",
              )}
            >
              {trend > 0 ? "↑" : "↓"}
              {Math.abs(trend)}
            </span>
          )}
        </div>
      </div>

      {expanded && entry.topWorkoutSummary && (
        <div className="px-3.5 pb-3 animate-fade-in border-t border-white/[0.05]">
          <p className="text-xs text-muted-foreground leading-relaxed pt-2.5 pl-[52px]">
            {entry.topWorkoutSummary}
          </p>
        </div>
      )}
    </Card>
  );
}
