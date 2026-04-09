"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "var(--bg-base)" }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: "rgba(248,113,113,0.1)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" style={{ color: "#F87171" }}>
          <path d="M12 9v4m0 4h.01M12 3l9.66 16.59A1 1 0 0120.66 21H3.34a1 1 0 01-.86-1.41L12 3z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="app-display text-2xl font-bold text-[var(--text-1)] mb-2">Something went wrong</h1>
      <p className="text-sm text-[var(--text-2)] max-w-xs mb-8">
        An unexpected error occurred. This has been logged and we&apos;ll look into it.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => window.location.href = "/"} variant="ghost">Go Home</Button>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
