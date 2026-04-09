"use client";
import { useState } from "react";
import { getScoreColor } from "@/lib/utils";

export function GamePlanCard({
  recommendation,
  predictedScore,
}: {
  recommendation: string;
  predictedScore: number;
}) {
  const [open, setOpen] = useState(false);
  const tierColor = getScoreColor(predictedScore ?? 0);

  return (
    <div className="bg-[var(--bg-surface)] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-[var(--bg-raised)]"
      >
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider"
            style={{ background: "rgba(0,240,181,0.1)", color: "var(--accent)" }}
          >
            AI
          </span>
          <div className="text-left">
            <span className="text-sm font-semibold text-[var(--text-1)] block leading-tight">
              Game Plan
            </span>
            <span className="text-[11px] text-[var(--text-3)]">
              Tactical recommendations
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span
            className="app-score text-xs font-bold px-2.5 py-1 rounded-lg"
            style={{ background: `${tierColor}15`, color: tierColor }}
          >
            Target {predictedScore ?? 0}
          </span>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className={`w-4 h-4 text-[var(--text-3)] transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 animate-fade-in" style={{ borderTop: "1px solid var(--bg-overlay)" }}>
          <p className="text-sm text-[var(--text-2)] leading-relaxed pt-3.5">
            {recommendation}
          </p>
        </div>
      )}
    </div>
  );
}
