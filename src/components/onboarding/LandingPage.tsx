"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";

export function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-6 py-12 relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Ambient orbs */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl animate-orb pointer-events-none"
        style={{ background: "rgba(50,215,75,0.06)" }}
      />
      <div
        className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{
          background: "rgba(10,132,255,0.05)",
          animation: "orb-float 8s ease-in-out infinite",
          animationDelay: "2s",
        }}
      />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2 pt-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "var(--accent-primary)" }}
        >
          <span className="text-black font-black text-lg">B</span>
        </div>
        <span className="text-xl font-black text-[var(--text-primary)]">Battleboard</span>
      </div>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        {/* Leaderboard preview */}
        <div className="glass-card w-full p-5 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--text-tertiary)]">This week · April 7-13</span>
            <span className="text-xs text-[var(--accent-primary)]">Live</span>
          </div>
          <div className="space-y-3">
            {[
              { name: "Jake", score: 312, rank: "🥇", bar: 100, color: "#FFD60A" },
              { name: "Rees", score: 298, rank: "🥈", bar: 95, color: "#32D74B" },
              { name: "Tom", score: 201, rank: "🥉", bar: 64, color: "#0A84FF" },
              { name: "Dave", score: 38, rank: "4", bar: 12, color: "#8E8E93" },
            ].map(({ name, score, rank, bar, color }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-base w-6 text-center">
                  {isNaN(parseInt(rank)) ? rank : <span className="text-[var(--text-tertiary)] text-sm">{rank}</span>}
                </span>
                <span className="text-sm font-medium text-[var(--text-primary)] w-10">
                  {name}
                </span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width: `${bar}%`, background: color }} />
                </div>
                <span className="text-sm font-bold" style={{ color }}>{score}</span>
              </div>
            ))}
          </div>
          <div
            className="mt-3 pt-3 border-t text-xs text-[var(--text-secondary)]"
            style={{ borderColor: "var(--glass-border)" }}
          >
            ⚔️ Loser buys a round 🍺
          </div>
        </div>

        <h1 className="text-3xl font-black text-[var(--text-primary)] leading-tight mb-3">
          Compete with your mates.
          <br />
          <span style={{ color: "var(--accent-primary)" }}>Any workout counts.</span>
        </h1>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-8">
          AI scores every workout fairly — whether you lift, run, box or do yoga.
          Weekly leaderboards. Real competition. Get off the sofa.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <SignUpButton mode="modal">
            <Button className="w-full" size="lg">
              Start Free Trial — 7 days free
            </Button>
          </SignUpButton>
          <SignInButton mode="modal">
            <Button variant="ghost" className="w-full" size="md">
              Already have an account? Sign in
            </Button>
          </SignInButton>
        </div>

        <p className="text-xs text-[var(--text-tertiary)] mt-4">
          £3.99/month after trial. Cancel anytime.
        </p>
      </div>

      {/* Bottom features */}
      <div className="relative z-10 flex gap-6 pb-4">
        {[
          { icon: "🤖", text: "AI scoring" },
          { icon: "🏆", text: "Leaderboards" },
          { icon: "🔗", text: "Strava sync" },
        ].map(({ icon, text }) => (
          <div key={text} className="flex flex-col items-center gap-1">
            <span className="text-2xl">{icon}</span>
            <span className="text-[10px] text-[var(--text-tertiary)]">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
