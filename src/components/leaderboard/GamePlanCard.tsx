"use client";

import { useState } from "react";

interface GamePlanCardProps {
  recommendation: string;
  predictedScore: number;
}

export function GamePlanCard({ recommendation, predictedScore }: GamePlanCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="glass-card p-4"
      style={{ borderColor: "rgba(50,215,75,0.2)" }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🤖</span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            Your AI Game Plan
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(50,215,75,0.15)",
              color: "var(--accent-primary)",
            }}
          >
            Target: {predictedScore}pts
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t animate-slide-up" style={{ borderColor: "var(--glass-border)" }}>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {recommendation}
          </p>
        </div>
      )}
    </div>
  );
}
