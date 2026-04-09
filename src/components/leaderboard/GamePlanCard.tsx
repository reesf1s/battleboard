"use client";
import { useState } from "react";

export function GamePlanCard({
  recommendation,
  predictedScore,
}: {
  recommendation: string;
  predictedScore: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid rgba(255,107,44,0.08)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--bg-hover)]"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
          >
            AI
          </div>
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
            style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
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
        <div className="px-5 pb-5 animate-fade-in" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-sm text-[var(--text-2)] leading-relaxed pt-4">
            {recommendation}
          </p>
        </div>
      )}
    </div>
  );
}
