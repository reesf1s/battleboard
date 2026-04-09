"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "rgba(248,113,113,0.1)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: "#F87171" }}>
          <path d="M12 9v4m0 4h.01M12 3l9.66 16.59A1 1 0 0120.66 21H3.34a1 1 0 01-.86-1.41L12 3z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="app-display text-xl font-bold text-[var(--text-1)] mb-2">Failed to load</h2>
      <p className="text-sm text-[var(--text-2)] max-w-[260px] mb-6">
        We couldn&apos;t load this page. Check your connection and try again.
      </p>
      <Button onClick={reset}>Retry</Button>
    </div>
  );
}
