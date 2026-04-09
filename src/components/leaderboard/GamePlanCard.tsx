"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
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
    <Card className="gap-0 py-0 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/[0.08] flex items-center justify-center flex-shrink-0">
            <span className="text-[9px] font-extrabold text-primary tracking-wider">AI</span>
          </div>
          <div className="text-left">
            <span className="text-[13px] font-semibold text-foreground block leading-tight">Game Plan</span>
            <span className="text-[11px] text-muted-foreground">Tactical recommendations</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="app-score text-[12px] font-bold px-2 py-0.5 rounded-md"
            style={{ background: `${tierColor}10`, color: tierColor }}
          >
            Target {predictedScore ?? 0}
          </span>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
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
        <div className="px-4 pb-3.5 animate-fade-in border-t border-white/[0.05]">
          <p className="text-[13px] text-muted-foreground leading-relaxed pt-3">
            {recommendation}
          </p>
        </div>
      )}
    </Card>
  );
}
