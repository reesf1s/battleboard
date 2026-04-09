import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "var(--bg-base)" }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: "var(--accent-dim)" }}
      >
        <span className="app-score text-3xl font-bold" style={{ color: "var(--accent)" }}>?</span>
      </div>
      <h1 className="app-display text-2xl font-bold text-[var(--text-1)] mb-2">Page not found</h1>
      <p className="text-sm text-[var(--text-2)] max-w-xs mb-8">
        This page doesn&apos;t exist or has been moved.
      </p>
      <a href="/">
        <Button>Back to Battleboard</Button>
      </a>
    </div>
  );
}
