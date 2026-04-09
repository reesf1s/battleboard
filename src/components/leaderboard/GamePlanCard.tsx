"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        className="w-full flex items-center justify-between px-4 py-4 transition-all hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(145deg, rgba(0,240,181,0.12), rgba(0,240,181,0.04))",
            }}
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-primary">
              <path d="M8 2v4l3 2M8 14A6 6 0 108 2a6 6 0 000 12z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-left">
            <span className="text-sm font-bold text-foreground block leading-tight">
              Game Plan
            </span>
            <span className="text-[11px] text-muted-foreground">
              AI tactical recommendations
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span
            className="text-xs font-extrabold px-2.5 py-1 rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${tierColor}18, ${tierColor}08)`,
              color: tierColor,
              border: `1px solid ${tierColor}12`,
            }}
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
        <div className="px-4 pb-4 animate-fade-in" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-sm text-muted-foreground leading-relaxed pt-3.5">
            {recommendation}
          </p>
        </div>
      )}
    </Card>
  );
}
