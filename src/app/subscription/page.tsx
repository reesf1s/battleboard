"use client";

import { useState } from "react";
import { isDemoMode } from "@/lib/demo";
import { Button } from "@/components/ui/Button";

const PLANS = [
  {
    id: "monthly",
    label: "Monthly",
    price: "\u00A33.99",
    period: "/month",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY,
    badge: null as string | null,
    sub: null as string | null,
  },
  {
    id: "yearly",
    label: "Yearly",
    price: "\u00A329.99",
    period: "/year",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY,
    badge: "Save 37%",
    sub: "\u00A32.50/mo billed annually",
  },
];

const FEATURES = [
  "AI workout scoring for any sport",
  "Weekly leaderboards with live updates",
  "Strava and Apple Health sync",
  "AI game plan and weekly narrative",
  "Streaks, reactions, group banter",
];

export default function SubscriptionPage() {
  const demo = isDemoMode();
  const [selected, setSelected] = useState("yearly");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (demo) return;
    const plan = PLANS.find((p) => p.id === selected);
    if (!plan?.priceId) return;
    setLoading(true);

    // Dynamic import to avoid Clerk crash in demo mode
    const { useUser } = await import("@clerk/nextjs");
    // Note: can't use hook here, need to pass email differently
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId: plan.priceId }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12 max-w-sm mx-auto"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "var(--accent)" }}
        >
          <span className="text-black text-2xl font-black">B</span>
        </div>
        <h1 className="app-display text-2xl font-bold text-[var(--text-1)] mb-1.5">Unlock Battleboard</h1>
        <p className="text-[var(--text-2)] text-sm">7-day free trial, then choose your plan.</p>
      </div>

      {/* Features */}
      <div
        className="w-full rounded-2xl px-5 py-5 mb-6"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div className="space-y-3.5">
          {FEATURES.map((text) => (
            <div key={text} className="flex items-center gap-3">
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 flex-shrink-0" style={{ color: "var(--accent)" }}>
                <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm text-[var(--text-2)]">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plan selector */}
      <div className="flex flex-col gap-2.5 w-full mb-6">
        {PLANS.map((plan) => {
          const active = selected === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className="rounded-2xl p-4 flex items-center justify-between transition-all text-left"
              style={{
                border: active ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                background: active ? "var(--accent-dim)" : "var(--bg-surface)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: active ? "var(--accent)" : "var(--text-3)" }}
                >
                  {active && <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text-1)]">{plan.label}</span>
                    {plan.badge && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                        style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
                      >
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  {plan.sub && <p className="text-xs text-[var(--text-3)] mt-0.5">{plan.sub}</p>}
                </div>
              </div>
              <div className="text-right">
                <span className="app-score text-lg font-bold text-[var(--text-1)]">{plan.price}</span>
                <span className="text-xs text-[var(--text-3)] ml-0.5">{plan.period}</span>
              </div>
            </button>
          );
        })}
      </div>

      <Button onClick={handleSubscribe} loading={loading} className="w-full" size="lg">
        Start Free Trial
      </Button>

      <p className="text-xs text-[var(--text-3)] text-center mt-4 leading-relaxed">
        7-day free trial. Payment charged after trial ends.{" "}
        <a href="/privacy" className="underline hover:text-[var(--text-2)]">Privacy</a>
        {" · "}
        <a href="/terms" className="underline hover:text-[var(--text-2)]">Terms</a>
      </p>
    </div>
  );
}
