"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";

const PLANS = [
  {
    id: "monthly",
    label: "Monthly",
    price: "£3.99",
    period: "/month",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY,
    badge: null,
  },
  {
    id: "yearly",
    label: "Yearly",
    price: "£29.99",
    period: "/year",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY,
    badge: "Save 37%",
    perMonth: "£2.50/mo",
  },
];

export default function SubscriptionPage() {
  const { user } = useUser();
  const [selected, setSelected] = useState("yearly");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    const plan = PLANS.find((p) => p.id === selected);
    if (!plan || !plan.priceId) return;

    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId: plan.priceId,
        email: user?.primaryEmailAddress?.emailAddress,
      }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 max-w-sm mx-auto"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="text-center mb-10">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "var(--accent-primary)" }}
        >
          <span className="text-black text-3xl font-black">B</span>
        </div>
        <h1 className="text-2xl font-black text-[var(--text-primary)] mb-2">
          Unlock Battleboard
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          7-day free trial, then choose your plan.
        </p>
      </div>

      {/* Features */}
      <div className="glass-card p-5 w-full mb-6">
        <div className="space-y-3">
          {[
            { icon: "🤖", text: "AI workout scoring — any sport, fairly" },
            { icon: "🏆", text: "Weekly leaderboards with real-time updates" },
            { icon: "🔗", text: "Strava + Apple Health sync" },
            { icon: "📊", text: "AI weekly game plan & narrative" },
            { icon: "🔥", text: "Streaks, reactions, group banter" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <span className="text-lg">{icon}</span>
              <span className="text-sm text-[var(--text-secondary)]">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plan selector */}
      <div className="flex flex-col gap-3 w-full mb-6">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelected(plan.id)}
            className="glass-card p-4 flex items-center justify-between transition-all active:scale-[0.99]"
            style={
              selected === plan.id
                ? { borderColor: "var(--accent-primary)", background: "rgba(50,215,75,0.06)" }
                : {}
            }
          >
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor:
                    selected === plan.id ? "var(--accent-primary)" : "var(--text-tertiary)",
                }}
              >
                {selected === plan.id && (
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: "var(--accent-primary)" }}
                  />
                )}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {plan.label}
                  </span>
                  {plan.badge && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(50,215,75,0.15)", color: "var(--accent-primary)" }}
                    >
                      {plan.badge}
                    </span>
                  )}
                </div>
                {(plan as any).perMonth && (
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {(plan as any).perMonth} billed annually
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-[var(--text-primary)]">{plan.price}</span>
              <span className="text-xs text-[var(--text-tertiary)]">{plan.period}</span>
            </div>
          </button>
        ))}
      </div>

      <Button onClick={handleSubscribe} loading={loading} className="w-full" size="lg">
        Start Free Trial
      </Button>

      <p className="text-xs text-[var(--text-tertiary)] text-center mt-4 leading-relaxed">
        7-day free trial. Payment charged after trial ends. Subscription auto-renews unless cancelled 24h before renewal.{" "}
        <a href="/privacy" className="underline">Privacy</a> ·{" "}
        <a href="/terms" className="underline">Terms</a>
      </p>
    </div>
  );
}
