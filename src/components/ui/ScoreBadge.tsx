"use client";
import { cn, getScoreColor, getScoreLabel } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  animate?: boolean;
  className?: string;
}

export function ScoreBadge({ score, size = "md", showLabel = false, animate = false, className }: ScoreBadgeProps) {
  const color = getScoreColor(score);

  const textSize = {
    sm: "text-sm font-bold",
    md: "text-xl font-bold",
    lg: "text-4xl font-bold",
    xl: "text-6xl font-bold",
  }[size];

  const wh = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
    xl: "w-32 h-32",
  }[size];

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-lg",
          wh,
          animate && "animate-score-in",
        )}
        style={{ background: `${color}10` }}
      >
        <span className={cn("app-score", textSize)} style={{ color }}>
          {score}
        </span>
      </div>
      {showLabel && (
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color, opacity: 0.7 }}
        >
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}
