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
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY,
    badge: null as string | null,
    sub: null as string | null,
  },
  {
    id: "yearly",
    label: "Yearly",
    price: "\u00A329.99",
    period: "/year",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY,
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
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (demo) return;
    setError(null);
    const plan = PLANS.find((p) => p.id === selected);
    if (!plan?.priceId || plan.priceId.includes("placeholder")) {
      setError("Subscriptions are not configured yet. Please try again later.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12 max-w-sm mx-auto w-full"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 btn-gradient"
        >
          <span className="text-[#09090B] text-2xl font-black">B</span>
        </div>
        <h1 className="app-display text-2xl font-bold text-[var(--text-1)] mb-1.5">Unlock Battleboard</h1>
        <p className="text-[var(--text-2)] text-sm">7-day free trial, then choose your plan.</p>
      </div>

      {/* Features */}
      <div
        className="w-full rounded-xl px-5 py-5 mb-6"
        style={{ background: "var(--bg-surface)" }}
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
              className="rounded-xl p-4 flex items-center justify-between transition-all text-left"
              style={{
                boxShadow: active ? "0 0 0 1.5px var(--accent)" : "none",
                background: active ? "var(--bg-raised)" : "var(--bg-surface)",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: active ? "var(--accent)" : "var(--text-3)" }}
                >
                  {active && <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text-1)]">{plan.label}</span>
                    {plan.badge && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                        style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
                      >
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  {plan.sub && <p className="text-xs text-[var(--text-3)] mt-0.5">{plan.sub}</p>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="app-score text-lg font-bold text-[var(--text-1)]">{plan.price}</span>
                <span className="text-xs text-[var(--text-3)] ml-0.5">{plan.period}</span>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-[#F87171] text-center mb-3">{error}</p>
      )}

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
