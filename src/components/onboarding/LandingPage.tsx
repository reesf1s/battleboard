"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-5 py-10"
      style={{ background: "var(--bg-base)" }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 pt-4 self-start">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "var(--accent)" }}>
          <span className="text-black font-black text-base">B</span>
        </div>
        <span className="text-lg font-black text-[var(--text-1)]">Battleboard</span>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center text-center max-w-sm w-full">
        {/* Leaderboard preview card */}
        <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-[var(--text-3)] uppercase tracking-wider">This week</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
              style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>Live</span>
          </div>
          <div className="space-y-3">
            {[
              { name: "Jake",  score: 312, rank: "🥇", pct: 100, color: "#FBBF24" },
              { name: "Rees",  score: 298, rank: "🥈", pct: 95,  color: "#4ADE80" },
              { name: "Tom",   score: 201, rank: "🥉", pct: 64,  color: "#60A5FA" },
              { name: "Dave",  score: 38,  rank: "4",  pct: 12,  color: "#6B7280" },
            ].map(({ name, score, rank, pct, color }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-sm w-5 text-center"
                  style={{ color: isNaN(parseInt(rank)) ? undefined : "var(--text-3)" }}>
                  {rank}
                </span>
                <span className="text-sm font-medium text-[var(--text-1)] w-10 text-left">{name}</span>
                <div className="flex-1 h-1 rounded-full overflow-hidden"
                  style={{ background: "var(--bg-overlay)" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: color }} />
                </div>
                <span className="text-sm font-bold tabular-nums w-8 text-right" style={{ color }}>{score}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t text-xs text-[var(--text-3)]"
            style={{ borderColor: "var(--border)" }}>
            ⚔️ Loser buys a round 🍺
          </div>
        </div>

        <h1 className="text-3xl font-black text-[var(--text-1)] leading-tight mb-3">
          Compete with your mates.
          <br />
          <span style={{ color: "var(--accent)" }}>Any workout counts.</span>
        </h1>
        <p className="text-[var(--text-2)] text-sm leading-relaxed mb-8 max-w-xs">
          AI scores every workout fairly — whether you lift, run, box or do yoga.
          Weekly leaderboards. Real competition.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <SignUpButton mode="modal">
            <Button className="w-full" size="lg">
              Start Free Trial — 7 days free
            </Button>
          </SignUpButton>
          <SignInButton mode="modal">
            <Button variant="ghost" className="w-full" size="md">
              Sign in
            </Button>
          </SignInButton>
        </div>

        <p className="text-xs text-[var(--text-3)] mt-4">£3.99/month after trial · Cancel anytime</p>
      </div>

      {/* Feature row */}
      <div className="flex gap-8 pb-2">
        {[
          { icon: "🤖", text: "AI scoring" },
          { icon: "🏆", text: "Leaderboards" },
          { icon: "🔗", text: "Strava sync" },
        ].map(({ icon, text }) => (
          <div key={text} className="flex flex-col items-center gap-1.5">
            <span className="text-xl">{icon}</span>
            <span className="text-[10px] text-[var(--text-3)] font-medium">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
