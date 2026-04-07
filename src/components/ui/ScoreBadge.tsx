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

export function ScoreBadge({
  score,
  size = "md",
  showLabel = false,
  animate = false,
  className,
}: ScoreBadgeProps) {
  const tier = getScoreTier(score);
  const color = getScoreColor(score);

  const sizeClasses = {
    sm: "text-lg font-bold",
    md: "text-2xl font-bold",
    lg: "text-4xl font-bold",
    xl: "text-6xl font-black",
  };

  const containerSizes = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-36 h-36",
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full",
          containerSizes[size],
          animate && "animate-score-reveal",
          tier === "legendary" && "glow-legendary",
          tier === "excellent" && "glow-excellent",
          tier === "solid" && "glow-solid"
        )}
        style={{
          background: `radial-gradient(circle at center, ${color}18 0%, transparent 70%)`,
          border: `2px solid ${color}40`,
        }}
      >
        <span
          className={cn(sizeClasses[size], `score-${tier}`)}
          style={{ color }}
        >
          {score}
        </span>
        {animate && (
          <div
            className="absolute inset-0 rounded-full animate-score-ring"
            style={{
              border: `2px solid ${color}`,
              animation: "score-ring 1s ease-out forwards",
            }}
          />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-medium" style={{ color }}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}
