"use client";
import { useState } from "react";

export function GamePlanCard({ recommendation, predictedScore }: {
  recommendation: string;
  predictedScore: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border bg-[var(--bg-surface)]"
      style={{ borderColor: "var(--accent)/20", borderColor: "rgba(74,222,128,0.15)" }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-base">🤖</span>
          <span className="text-sm font-semibold text-[var(--text-1)]">AI Game Plan</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-md"
            style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
            Target {predictedScore}pts
          </span>
          <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 text-[var(--text-3)] transition-transform ${open ? "rotate-180" : ""}`}>
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 animate-fade-in" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-sm text-[var(--text-2)] leading-relaxed pt-3">{recommendation}</p>
        </div>
      )}
    </div>
  );
}
