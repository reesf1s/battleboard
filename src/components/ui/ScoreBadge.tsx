"use client";
import { cn } from "@/lib/utils";
import { getScoreTier, getScoreColor, getScoreLabel } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  animate?: boolean;
  className?: string;
}

export function ScoreBadge({ score, size = "md", showLabel = false, animate = false, className }: ScoreBadgeProps) {
  const tier  = getScoreTier(score);
  const color = getScoreColor(score);

  const textSize = { sm: "text-base font-bold", md: "text-2xl font-bold", lg: "text-4xl font-bold", xl: "text-6xl font-black" }[size];
  const wh       = { sm: "w-10 h-10", md: "w-14 h-14", lg: "w-20 h-20", xl: "w-32 h-32" }[size];

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        className={cn("relative flex items-center justify-center rounded-xl", wh, animate && "animate-score-in")}
        style={{ background: `${color}14`, border: `1.5px solid ${color}30` }}
      >
        <span className={textSize} style={{ color }}>{score}</span>
      </div>
      {showLabel && (
        <span className="text-xs font-medium" style={{ color }}>{getScoreLabel(score)}</span>
      )}
    </div>
  );
}
