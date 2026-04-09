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

  return (
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0"
      style={{ background: `${badgeColor}15`, color: badgeColor }}
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
      className="gap-0 py-0 cursor-pointer transition-colors hover:bg-[#18181C]"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3 px-3.5 py-3">
        <RankBadge rank={rank} color={color} />

        <div className="relative flex-shrink-0">
          <Avatar className="size-9 rounded-lg after:rounded-lg">
            {entry.user?.avatarUrl && (
              <AvatarImage src={entry.user.avatarUrl} alt={entry.user?.name || ""} className="rounded-lg" />
            )}
            <AvatarFallback className="rounded-lg text-sm font-semibold bg-[#1E1E23] text-muted-foreground">
              {entry.user?.name?.[0] ?? "?"}
            </AvatarFallback>
          </Avatar>
          {isCurrentUser && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#141416]"
              style={{ background: "#00F0B5" }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[14px] font-semibold text-foreground truncate leading-tight">
              {entry.user?.name ?? "Unknown"}
            </span>
            {isCurrentUser && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wider font-bold">
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
          <div className="mt-2 h-1 rounded-full overflow-hidden bg-white/[0.04]">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${pct}%`,
                background: color,
                opacity: isCurrentUser ? 1 : 0.7,
              }}
            />
          </div>
        </div>

        <div className="flex flex-col items-end flex-shrink-0 ml-2">
          <span className="app-score text-lg font-extrabold leading-none" style={{ color }}>
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
              {trend > 0 ? `+${trend}` : trend}
            </span>
          )}
        </div>
      </div>

      {expanded && entry.topWorkoutSummary && (
        <div className="px-3.5 pb-3 animate-fade-in border-t border-white/[0.04]">
          <p className="text-xs text-muted-foreground leading-relaxed pt-2.5 pl-10">
            {entry.topWorkoutSummary}
          </p>
        </div>
      )}
    </Card>
  );
}
