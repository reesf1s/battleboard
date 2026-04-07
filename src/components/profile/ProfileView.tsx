"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { getActivityEmoji, getScoreColor, getWeekId } from "@/lib/utils";

interface Workout {
  _id: string;
  activityType: string;
  effortScore: number;
  scored: boolean;
  startedAt: number;
  weekId: string;
}

interface ProfileViewProps {
  user: {
    _id: string;
    name: string;
    avatarUrl?: string;
    currentStreak: number;
    longestStreak: number;
    avgWeeklyWorkouts: number;
    typicalActivities: string[];
    fitnessLevel: string;
    stravaConnected: boolean;
    subscriptionStatus: string;
    subscriptionExpiresAt?: number;
  };
  groups: { _id: string; name: string; emoji?: string }[];
  workouts: Workout[];
}

export function ProfileView({ user, groups, workouts }: ProfileViewProps) {
  const { signOut } = useClerk();

  const scoredWorkouts = workouts.filter((w) => w.scored);
  const totalWorkouts = scoredWorkouts.length;
  const avgScore =
    totalWorkouts > 0
      ? Math.round(scoredWorkouts.reduce((s, w) => s + w.effortScore, 0) / totalWorkouts)
      : 0;

  // Activity breakdown
  const activityCounts: Record<string, number> = {};
  scoredWorkouts.forEach((w) => {
    activityCounts[w.activityType] = (activityCounts[w.activityType] || 0) + 1;
  });
  const topActivities = Object.entries(activityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Personal bests by activity type
  const pbsByActivity: Record<string, { score: number; date: number }> = {};
  scoredWorkouts.forEach((w) => {
    const existing = pbsByActivity[w.activityType];
    if (!existing || w.effortScore > existing.score) {
      pbsByActivity[w.activityType] = { score: w.effortScore, date: w.startedAt };
    }
  });
  const pbs = Object.entries(pbsByActivity)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 5);

  // Heatmap — last 12 weeks
  const heatmapData = buildHeatmap(scoredWorkouts);

  const trialDaysLeft = user.subscriptionExpiresAt
    ? Math.max(0, Math.ceil((user.subscriptionExpiresAt - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="flex flex-col min-h-screen px-4 pt-14 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{ background: "var(--bg-elevated)" }}
          >
            {user.name[0]}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{user.name}</h1>
          <p className="text-sm text-[var(--text-secondary)] capitalize">
            {user.fitnessLevel} · {user.subscriptionStatus === "trial"
              ? `Trial — ${trialDaysLeft}d left`
              : user.subscriptionStatus}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total", value: totalWorkouts, unit: "workouts" },
          { label: "Avg score", value: avgScore, unit: "pts" },
          {
            label: "Streak",
            value: user.currentStreak,
            unit: "weeks 🔥",
          },
        ].map(({ label, value, unit }) => (
          <div key={label} className="glass-card-sm p-3 text-center">
            <div className="text-2xl font-black text-[var(--text-primary)]">{value}</div>
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">
              {unit}
            </div>
          </div>
        ))}
      </div>

      {/* Streak info */}
      {user.currentStreak > 0 && (
        <div
          className="glass-card-sm px-4 py-3 mb-5 flex items-center gap-2"
          style={{ borderColor: "rgba(255,107,53,0.3)" }}
        >
          <span className="text-xl">🔥</span>
          <p className="text-sm text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">
              {user.currentStreak}-week streak
            </span>
            {" — "}You've trained 3+ days a week for {user.currentStreak} consecutive weeks.
            Longest ever: {user.longestStreak} weeks.
          </p>
        </div>
      )}

      {/* Heatmap */}
      <div className="glass-card p-4 mb-5">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
          Workout Activity
        </h3>
        <HeatmapGrid data={heatmapData} />
      </div>

      {/* Personal Bests */}
      {pbs.length > 0 && (
        <div className="glass-card p-4 mb-5">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
            Personal Bests
          </h3>
          <div className="space-y-2.5">
            {pbs.map(([activity, { score, date }]) => {
              const color = getScoreColor(score);
              return (
                <div key={activity} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{getActivityEmoji(activity)}</span>
                    <span className="text-sm text-[var(--text-primary)]">{activity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-bold"
                      style={{ color }}
                    >
                      {score}pts
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {new Date(date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Connected accounts */}
      <div className="glass-card p-4 mb-5">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
          Connected Accounts
        </h3>
        <div className="space-y-3">
          <ConnectedAccount
            name="Strava"
            icon="🟠"
            connected={user.stravaConnected}
            connectHref="/api/strava/auth"
          />
          <ConnectedAccount
            name="Apple Health"
            icon="🍎"
            connected={false}
            connectHref="#"
            comingSoon
          />
          <ConnectedAccount
            name="Garmin"
            icon="🟢"
            connected={false}
            connectHref="#"
            comingSoon
          />
        </div>
      </div>

      {/* Groups */}
      {groups.length > 0 && (
        <div className="glass-card p-4 mb-5">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
            Your Groups
          </h3>
          <div className="space-y-2">
            {groups.map((group) => (
              <a
                key={group._id}
                href="/dashboard/group-settings"
                className="flex items-center justify-between py-1 hover:opacity-80 transition-opacity"
              >
                <span className="text-sm text-[var(--text-primary)]">
                  {group.emoji} {group.name}
                </span>
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[var(--text-tertiary)]">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Settings links */}
      <div className="glass-card p-4 mb-5">
        <div className="space-y-1">
          {[
            { label: "Subscription", href: "/subscription" },
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms & Conditions", href: "/terms" },
            { label: "Support", href: "mailto:hello@battleboard.app" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="flex items-center justify-between py-2.5 hover:opacity-80 transition-opacity"
            >
              <span className="text-sm text-[var(--text-secondary)]">{label}</span>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[var(--text-tertiary)]">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </a>
          ))}
        </div>
      </div>

      <button
        onClick={() => signOut({ redirectUrl: "/" })}
        className="w-full py-3 text-sm font-medium text-[#FF453A] glass-card-sm rounded-2xl active:scale-98 transition-transform"
      >
        Sign Out
      </button>
    </div>
  );
}

function ConnectedAccount({
  name,
  icon,
  connected,
  connectHref,
  comingSoon,
}: {
  name: string;
  icon: string;
  connected: boolean;
  connectHref: string;
  comingSoon?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="text-sm text-[var(--text-primary)]">{name}</span>
        {comingSoon && (
          <span className="text-[10px] text-[var(--text-tertiary)] px-1.5 py-0.5 rounded-full bg-white/5">
            soon
          </span>
        )}
      </div>
      {!comingSoon && (
        <a
          href={connected ? "#" : connectHref}
          className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
            connected
              ? "text-[var(--accent-primary)] bg-[var(--accent-primary)]/10"
              : "text-[var(--text-secondary)] glass-card-sm"
          }`}
        >
          {connected ? "✓ Connected" : "Connect"}
        </a>
      )}
    </div>
  );
}

function buildHeatmap(workouts: Workout[]) {
  const data: Record<string, number> = {};
  workouts.forEach((w) => {
    const date = new Date(w.startedAt).toISOString().split("T")[0];
    data[date] = Math.max(data[date] || 0, w.effortScore);
  });
  return data;
}

function HeatmapGrid({ data }: { data: Record<string, number> }) {
  const days: { date: string; score: number }[] = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({ date: dateStr, score: data[dateStr] || 0 });
  }

  return (
    <div className="flex flex-wrap gap-1">
      {days.map(({ date, score }) => {
        const color =
          score === 0
            ? "rgba(255,255,255,0.04)"
            : score >= 90
            ? "#FFD60A"
            : score >= 75
            ? "#32D74B"
            : score >= 55
            ? "#0A84FF"
            : "#8E8E93";
        const opacity = score === 0 ? 1 : 0.6 + (score / 100) * 0.4;
        return (
          <div
            key={date}
            className="w-3 h-3 rounded-sm"
            style={{ background: color, opacity }}
            title={`${date}: ${score > 0 ? score + "pts" : "Rest day"}`}
          />
        );
      })}
    </div>
  );
}
