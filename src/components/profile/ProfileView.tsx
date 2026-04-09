"use client";
import { getScoreColor } from "@/lib/utils";

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
  onSignOut?: () => void;
}

export function ProfileView({ user, groups, workouts, onSignOut }: ProfileViewProps) {
  const scored = workouts.filter((w) => w.scored);
  const total = scored.length;
  const avg = total > 0 ? Math.round(scored.reduce((s, w) => s + w.effortScore, 0) / total) : 0;

  // PBs
  const pbs: Record<string, { score: number; date: number }> = {};
  scored.forEach((w) => {
    if (!pbs[w.activityType] || w.effortScore > pbs[w.activityType].score)
      pbs[w.activityType] = { score: w.effortScore, date: w.startedAt };
  });
  const topPBs = Object.entries(pbs).sort((a, b) => b[1].score - a[1].score).slice(0, 5);

  // Heatmap
  const heatmap: Record<string, number> = {};
  scored.forEach((w) => {
    const d = new Date(w.startedAt).toISOString().split("T")[0];
    heatmap[d] = Math.max(heatmap[d] ?? 0, w.effortScore);
  });
  const days = Array.from({ length: 84 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (83 - i));
    const k = d.toISOString().split("T")[0];
    return { key: k, score: heatmap[k] ?? 0 };
  });

  const trialLeft = user.subscriptionExpiresAt
    ? Math.max(0, Math.ceil((user.subscriptionExpiresAt - Date.now()) / 86400000))
    : 0;

  const handleSignOut = () => {
    if (onSignOut) onSignOut();
  };

  return (
    <div className="flex flex-col min-h-screen px-4 pt-14 pb-8 gap-5">
      {/* Identity */}
      <div className="flex items-center gap-4 py-2">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="w-16 h-16 rounded-2xl object-cover" />
        ) : (
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
            style={{ background: "var(--bg-raised)", color: "var(--text-2)" }}
          >
            {user.name?.[0] ?? "?"}
          </div>
        )}
        <div>
          <h1 className="app-display text-xl font-bold text-[var(--text-1)] leading-tight">{user.name}</h1>
          <p className="text-xs text-[var(--text-3)] capitalize mt-1 font-medium">
            {user.fitnessLevel} athlete
            {user.subscriptionStatus === "trial"
              ? ` · Trial ${trialLeft}d left`
              : user.subscriptionStatus === "active"
              ? " · Pro"
              : ""}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Workouts", value: total.toString() },
          { label: "Avg Score", value: avg.toString() },
          { label: "Streak", value: `${user.currentStreak}w` },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl px-3 py-4 text-center"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            <p className="app-score text-2xl font-bold text-[var(--text-1)] leading-none">{value}</p>
            <p className="text-[10px] text-[var(--text-3)] font-medium uppercase tracking-wider mt-2">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Streak callout */}
      {user.currentStreak > 0 && (
        <div
          className="rounded-2xl px-5 py-4 flex items-center gap-4"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(249,115,22,0.1)" }}
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" style={{ color: "#F97316" }}>
              <path d="M10 2C10 2 5 7 5 11a5 5 0 0010 0c0-2-1.5-3.5-2.5-4.5C11.5 5.5 12 4 12 4S10.5 5.5 10 6C9 5 10 2 10 2z" fill="currentColor" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-1)]">{user.currentStreak}-week streak</p>
            <p className="text-xs text-[var(--text-3)] mt-0.5">
              Trained 3+ days/week. Best ever: {user.longestStreak}w
            </p>
          </div>
        </div>
      )}

      {/* Activity heatmap */}
      <Section title="Activity">
        <div className="flex flex-wrap gap-[3px]">
          {days.map(({ key, score }) => {
            const bg =
              score === 0
                ? "var(--bg-overlay)"
                : score >= 90
                ? "var(--legendary)"
                : score >= 75
                ? "var(--excellent)"
                : score >= 55
                ? "var(--solid)"
                : "var(--light)";
            return (
              <div
                key={key}
                title={`${key}: ${score > 0 ? score + "pts" : "rest"}`}
                className="w-3 h-3 rounded-[3px]"
                style={{ background: bg, opacity: score === 0 ? 0.3 : 0.6 + score / 250 }}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-3">
          {[
            ["Rest", "var(--bg-overlay)"],
            ["Light", "var(--light)"],
            ["Solid", "var(--solid)"],
            ["Great", "var(--excellent)"],
            ["Elite", "var(--legendary)"],
          ].map(([l, c]) => (
            <div key={l} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c as string, opacity: 0.7 }} />
              <span className="text-[10px] text-[var(--text-3)]">{l}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Personal bests */}
      {topPBs.length > 0 && (
        <Section title="Personal Bests">
          <div className="space-y-0">
            {topPBs.map(([activity, { score, date }], i) => {
              const color = getScoreColor(score);
              return (
                <div
                  key={activity}
                  className="flex items-center justify-between py-3"
                  style={i < topPBs.length - 1 ? { borderBottom: "1px solid var(--border)" } : {}}
                >
                  <span className="text-sm text-[var(--text-1)]">{activity}</span>
                  <div className="flex items-center gap-3">
                    <span className="app-score text-sm font-bold" style={{ color }}>
                      {score}
                    </span>
                    <span className="text-xs text-[var(--text-3)] w-16 text-right">
                      {new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Connected accounts */}
      <Section title="Connected">
        <div className="space-y-0">
          <AccountRow name="Strava" connected={user.stravaConnected} href="/api/strava/auth" />
          <AccountRow name="Apple Health" connected={false} href="#" soon />
          <AccountRow name="Garmin" connected={false} href="#" soon />
        </div>
      </Section>

      {/* Groups */}
      {groups.length > 0 && (
        <Section title="Groups">
          {groups.map((g) => (
            <a
              key={g._id}
              href="/dashboard/group-settings"
              className="flex items-center justify-between py-3 hover:opacity-70 transition-opacity"
            >
              <span className="text-sm text-[var(--text-1)]">{g.name}</span>
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[var(--text-3)]">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </a>
          ))}
        </Section>
      )}

      {/* Settings links */}
      <Section title="">
        {[
          ["Subscription", "/subscription"],
          ["Privacy Policy", "/privacy"],
          ["Terms & Conditions", "/terms"],
          ["Support", "mailto:hello@battleboard.app"],
        ].map(([label, href], i, arr) => (
          <a
            key={label}
            href={href}
            className="flex items-center justify-between py-3 hover:opacity-70 transition-opacity"
            style={i < arr.length - 1 ? { borderBottom: "1px solid var(--border)" } : {}}
          >
            <span className="text-sm text-[var(--text-2)]">{label}</span>
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[var(--text-3)]">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </a>
        ))}
      </Section>

      {/* Sign out */}
      {onSignOut && (
        <button
          onClick={handleSignOut}
          className="w-full py-3.5 text-sm font-semibold rounded-2xl transition-colors hover:opacity-80"
          style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", color: "#F87171" }}
        >
          Sign Out
        </button>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl px-5 py-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
      {title && (
        <p className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-widest mb-4">{title}</p>
      )}
      {children}
    </div>
  );
}

function AccountRow({
  name,
  connected,
  href,
  soon,
}: {
  name: string;
  connected: boolean;
  href: string;
  soon?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between py-3"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-sm text-[var(--text-1)]">{name}</span>
        {soon && (
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
            style={{ background: "var(--bg-overlay)", color: "var(--text-3)" }}
          >
            Soon
          </span>
        )}
      </div>
      {!soon && (
        <a
          href={connected ? "#" : href}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          style={
            connected
              ? { background: "var(--excellent-dim)", color: "var(--excellent)" }
              : { background: "var(--bg-raised)", color: "var(--text-2)", border: "1px solid var(--border)" }
          }
        >
          {connected ? "Connected" : "Connect"}
        </a>
      )}
    </div>
  );
}
