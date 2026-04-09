"use client";
import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProLockedOverlay } from "@/components/ui/ProLockedOverlay";
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
    subscriptionTier?: string;
    subscriptionExpiresAt?: number;
  };
  groups: { _id: string; name: string; emoji?: string }[];
  workouts: Workout[];
  onSignOut?: () => void;
}

export function ProfileView({ user, groups, workouts, onSignOut }: ProfileViewProps) {
  const isPro = user.subscriptionTier === "pro";

  const handleStravaConnect = useCallback(() => {
    const stravaClientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
    if (!stravaClientId || stravaClientId.includes("your_") || stravaClientId.includes("placeholder") || stravaClientId.length <= 3) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://fitness-ivory-omega.vercel.app";
    const params = new URLSearchParams({
      client_id: stravaClientId,
      redirect_uri: `${origin}/api/strava/callback`,
      response_type: "code",
      approval_prompt: "auto",
      scope: "activity:read_all",
      state: user._id,
    });
    window.location.href = `https://www.strava.com/oauth/authorize?${params}`;
  }, [user._id]);

  const scored = workouts.filter((w) => w.scored);
  const total = scored.length;
  const avg = total > 0 ? Math.round(scored.reduce((s, w) => s + w.effortScore, 0) / total) : 0;

  const pbs: Record<string, { score: number; date: number }> = {};
  scored.forEach((w) => {
    if (!pbs[w.activityType] || w.effortScore > pbs[w.activityType].score)
      pbs[w.activityType] = { score: w.effortScore, date: w.startedAt };
  });
  const topPBs = Object.entries(pbs).sort((a, b) => b[1].score - a[1].score).slice(0, 5);

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

  return (
    <div className="flex flex-col min-h-screen w-full px-4 pt-14 pb-8 gap-3">
      {/* Identity */}
      <div className="flex items-center gap-3.5 py-2">
        <Avatar className="size-14 rounded-2xl after:rounded-2xl">
          {user.avatarUrl && (
            <AvatarImage src={user.avatarUrl} alt={user.name} className="rounded-2xl" />
          )}
          <AvatarFallback className="rounded-2xl text-xl font-bold bg-[#1E1E23] text-[#666]">
            {user.name?.[0] ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="app-display text-xl font-bold text-foreground leading-tight truncate">{user.name}</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[11px] font-medium text-muted-foreground capitalize bg-white/[0.05] px-2 py-0.5 rounded-md">
              {user.fitnessLevel}
            </span>
            {user.subscriptionStatus === "trial" ? (
              <span className="text-[11px] font-semibold text-primary bg-primary/[0.08] px-2 py-0.5 rounded-md">
                Trial {trialLeft}d
              </span>
            ) : user.subscriptionStatus === "active" ? (
              <span className="text-[11px] font-semibold text-primary bg-primary/[0.08] px-2 py-0.5 rounded-md">
                {user.subscriptionTier === "pro" ? "Pro" : "Compete"}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Workouts", value: total.toString() },
          { label: "Avg Score", value: avg.toString() },
          { label: "Streak", value: `${user.currentStreak}w` },
        ].map(({ label, value }) => (
          <Card key={label} className="gap-0 py-4 items-center text-center">
            <p className="app-score text-[26px] font-black text-foreground leading-none tracking-tight">{value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1.5 font-medium">
              {label}
            </p>
          </Card>
        ))}
      </div>

      {/* Streak callout */}
      {user.currentStreak > 0 && (
        <Card className="gap-0 py-0">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-xl bg-primary/[0.08] flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-primary">
                <path d="M10 2C10 2 5 7 5 11a5 5 0 0010 0c0-2-1.5-3.5-2.5-4.5C11.5 5.5 12 4 12 4S10.5 5.5 10 6C9 5 10 2 10 2z" fill="currentColor" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{user.currentStreak}-week streak</p>
              <p className="text-xs text-muted-foreground">Best ever: {user.longestStreak}w</p>
            </div>
            <span className="app-score text-lg font-bold text-primary">{user.currentStreak}w</span>
          </div>
        </Card>
      )}

      {/* Activity heatmap */}
      {!isPro ? (
        <ProLockedOverlay
          featureName="Activity Heatmap"
          description="Track your training patterns over 12 weeks"
        >
          <Card className="gap-0 py-0">
            <div className="px-4 pt-3.5 pb-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">Activity</p>
            </div>
            <div className="px-4 pb-3.5">
              <div className="flex flex-wrap gap-[3px] mt-2">
                {days.map(({ key, score }) => {
                  const bg =
                    score === 0
                      ? "rgba(255,255,255,0.04)"
                      : score >= 90
                      ? "#FFD700"
                      : score >= 75
                      ? "#00F0B5"
                      : score >= 55
                      ? "#A78BFA"
                      : "#64748B";
                  return (
                    <div
                      key={key}
                      title={`${key}: ${score > 0 ? score + "pts" : "rest"}`}
                      className="w-[11px] h-[11px] rounded-[2.5px]"
                      style={{
                        background: bg,
                        opacity: score === 0 ? 0.2 : 0.55 + score / 250,
                      }}
                    />
                  );
                })}
              </div>
              <div className="flex items-center gap-3 mt-3">
                {[
                  ["Rest", "rgba(255,255,255,0.06)"],
                  ["Mod", "#64748B"],
                  ["Solid", "#A78BFA"],
                  ["Great", "#00F0B5"],
                  ["Elite", "#FFD700"],
                ].map(([l, c]) => (
                  <div key={l} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm" style={{ background: c as string, opacity: 0.7 }} />
                    <span className="text-[9px] text-muted-foreground">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </ProLockedOverlay>
      ) : (
        <Card className="gap-0 py-0">
          <div className="px-4 pt-3.5 pb-1">
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">Activity</p>
          </div>
          <div className="px-4 pb-3.5">
            <div className="flex flex-wrap gap-[3px] mt-2">
              {days.map(({ key, score }) => {
                const bg =
                  score === 0
                    ? "rgba(255,255,255,0.04)"
                    : score >= 90
                    ? "#FFD700"
                    : score >= 75
                    ? "#00F0B5"
                    : score >= 55
                    ? "#A78BFA"
                    : "#64748B";
                return (
                  <div
                    key={key}
                    title={`${key}: ${score > 0 ? score + "pts" : "rest"}`}
                    className="w-[11px] h-[11px] rounded-[2.5px]"
                    style={{
                      background: bg,
                      opacity: score === 0 ? 0.2 : 0.55 + score / 250,
                    }}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-3 mt-3">
              {[
                ["Rest", "rgba(255,255,255,0.06)"],
                ["Mod", "#64748B"],
                ["Solid", "#A78BFA"],
                ["Great", "#00F0B5"],
                ["Elite", "#FFD700"],
              ].map(([l, c]) => (
                <div key={l} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm" style={{ background: c as string, opacity: 0.7 }} />
                  <span className="text-[9px] text-muted-foreground">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Personal bests */}
      {topPBs.length > 0 && (
        !isPro ? (
          <ProLockedOverlay
            featureName="Personal Bests"
            description="Track your top scores across every activity"
          >
            <Card className="gap-0 py-0">
              <div className="px-4 pt-3.5 pb-0">
                <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">Personal Bests</p>
              </div>
              <div className="px-4 pb-1">
                {topPBs.map(([activity, { score, date }], i) => {
                  const color = getScoreColor(score);
                  return (
                    <div key={activity}>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-[13px] text-foreground truncate mr-3">{activity}</span>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span
                            className="app-score text-[13px] font-bold px-2 py-0.5 rounded-md"
                            style={{ background: `${color}10`, color }}
                          >
                            {score}
                          </span>
                          <span className="text-[11px] text-muted-foreground w-14 text-right">
                            {new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      </div>
                      {i < topPBs.length - 1 && <Separator />}
                    </div>
                  );
                })}
              </div>
            </Card>
          </ProLockedOverlay>
        ) : (
          <Card className="gap-0 py-0">
            <div className="px-4 pt-3.5 pb-0">
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">Personal Bests</p>
            </div>
            <div className="px-4 pb-1">
              {topPBs.map(([activity, { score, date }], i) => {
                const color = getScoreColor(score);
                return (
                  <div key={activity}>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-[13px] text-foreground truncate mr-3">{activity}</span>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className="app-score text-[13px] font-bold px-2 py-0.5 rounded-md"
                          style={{ background: `${color}10`, color }}
                        >
                          {score}
                        </span>
                        <span className="text-[11px] text-muted-foreground w-14 text-right">
                          {new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                    {i < topPBs.length - 1 && <Separator />}
                  </div>
                );
              })}
            </div>
          </Card>
        )
      )}

      {/* Connected accounts */}
      <Card className="gap-0 py-0">
        <div className="px-4 pt-3.5 pb-0">
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">Connected</p>
        </div>
        <div className="px-4 pb-1">
          <AccountRow name="Strava" connected={user.stravaConnected} onConnect={handleStravaConnect} />
          <Separator />
          <AccountRow name="Garmin" connected={false} soon />
        </div>
      </Card>

      {/* Groups */}
      {groups.length > 0 && (
        <Card className="gap-0 py-0">
          <div className="px-4 pt-3.5 pb-0">
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">Groups</p>
          </div>
          <div className="px-4 pb-1">
            {groups.map((g, i) => (
              <div key={g._id}>
                <a
                  href="/dashboard/group-settings"
                  className="flex items-center justify-between py-3 hover:opacity-70 transition-opacity"
                >
                  <span className="text-[13px] text-foreground truncate mr-3">{g.name}</span>
                  <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </a>
                {i < groups.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Settings links */}
      <Card className="gap-0 py-0">
        <div className="px-4 py-1">
          {[
            ["Subscription", "/subscription"],
            ["Privacy Policy", "/privacy"],
            ["Terms & Conditions", "/terms"],
            ["Support", "mailto:hello@battleboard.app"],
          ].map(([label, href], i, arr) => (
            <div key={label}>
              <a
                href={href}
                className="flex items-center justify-between py-3 hover:opacity-70 transition-opacity"
              >
                <span className="text-[13px] text-muted-foreground">{label}</span>
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </a>
              {i < arr.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </Card>

      {/* Sign out */}
      {onSignOut && (
        <button
          onClick={onSignOut}
          className="w-full py-3 rounded-xl text-[13px] font-semibold bg-destructive/10 text-destructive transition-colors active:bg-destructive/15"
        >
          Sign Out
        </button>
      )}
    </div>
  );
}

function AccountRow({
  name,
  connected,
  onConnect,
  soon,
}: {
  name: string;
  connected: boolean;
  onConnect?: () => void;
  soon?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[13px] text-foreground">{name}</span>
        {soon && (
          <span className="text-[10px] text-muted-foreground bg-white/[0.05] px-1.5 py-0.5 rounded">Coming soon</span>
        )}
      </div>
      {!soon && (
        connected ? (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-primary/[0.08] text-primary">Connected</span>
        ) : (
          <button
            onClick={onConnect}
            className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-white/[0.06] text-foreground border border-white/[0.08] transition-colors active:bg-white/[0.1]"
          >
            Connect
          </button>
        )
      )}
    </div>
  );
}
