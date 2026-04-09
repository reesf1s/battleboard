"use client";

import { useState } from "react";
import { isDemoMode } from "@/lib/demo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "compete",
    name: "Compete",
    price: "99p",
    period: "/month",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_COMPETE,
    description: "Score & compete with your mates",
    features: [
      "AI workout scoring",
      "Weekly leaderboards",
      "Groups & invite codes",
      "Streaks & reactions",
      "Strava sync",
    ],
    cta: "Start Competing",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "\u00A33.99",
    period: "/month",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
    description: "AI coach in your pocket",
    features: [
      "Everything in Compete",
      "AI game plan & strategy",
      "Workout insights & analysis",
      "Personal best tracking",
      "Activity heatmap & trends",
    ],
    cta: "Go Pro",
    popular: true,
  },
];

export default function SubscriptionPage() {
  const demo = isDemoMode();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (demo) return;
    setError(null);
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan?.priceId || plan.priceId.includes("placeholder")) {
      setError("Subscriptions are not configured yet.");
      return;
    }
    setLoading(planId);

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
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-12 max-w-sm mx-auto w-full">
      {/* Back */}
      <a
        href="/dashboard"
        className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-8 hover:text-foreground transition-colors w-fit"
      >
        <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Back
      </a>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 btn-gradient">
          <span className="text-[#09090B] text-2xl font-black">B</span>
        </div>
        <h1 className="app-display text-[22px] font-bold text-foreground mb-1.5">Choose your plan</h1>
        <p className="text-[13px] text-muted-foreground">7-day free trial on both plans. Cancel anytime.</p>
      </div>

      {/* Plans */}
      <div className="flex flex-col gap-4 mb-6">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              "gap-0 py-0 overflow-hidden relative",
              plan.popular && "ring-1 ring-primary/30",
            )}
          >
            {plan.popular && (
              <div className="bg-primary/[0.08] text-primary text-[10px] font-bold text-center py-1.5 uppercase tracking-widest">
                Most Popular
              </div>
            )}
            <div className="p-4">
              {/* Plan header */}
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <h3 className="text-[15px] font-bold text-foreground">{plan.name}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{plan.description}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span className="app-score text-[22px] font-black text-foreground">{plan.price}</span>
                  <span className="text-[11px] text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2.5 mb-4">
                {plan.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2.5">
                    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 flex-shrink-0 text-primary">
                      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[13px] text-muted-foreground">{feat}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading !== null}
                className={cn(
                  "w-full",
                  plan.popular
                    ? "btn-gradient text-primary-foreground"
                    : "bg-white/[0.06] text-foreground hover:bg-white/[0.1] border border-white/[0.08]",
                )}
                size="lg"
              >
                {loading === plan.id ? "Starting..." : plan.cta}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {error && (
        <p className="text-[13px] text-destructive text-center mb-4">{error}</p>
      )}

      <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
        7-day free trial. Payment charged after trial ends.{" "}
        <a href="/privacy" className="underline hover:text-foreground/60">Privacy</a>
        {" · "}
        <a href="/terms" className="underline hover:text-foreground/60">Terms</a>
      </p>
    </div>
  );
}
