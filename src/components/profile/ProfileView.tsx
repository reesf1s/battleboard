"use client";
import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/Button";
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
    <div className="flex flex-col min-h-screen w-full px-5 pt-12 pb-8 gap-4">
      {/* Identity */}
      <div className="flex items-center gap-4 py-2">
        <Avatar className="size-16 rounded-xl after:rounded-xl">
          {user.avatarUrl && (
            <AvatarImage src={user.avatarUrl} alt={user.name} className="rounded-xl" />
          )}
          <AvatarFallback className="rounded-xl text-2xl font-bold bg-secondary text-muted-foreground">
            {user.name?.[0] ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="app-display text-xl font-bold text-foreground leading-tight truncate">{user.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs capitalize border-transparent">
              {user.fitnessLevel}
            </Badge>
            {user.subscriptionStatus === "trial" ? (
              <Badge className="text-xs bg-primary/10 text-primary border-transparent">
                Trial {trialLeft}d
              </Badge>
            ) : user.subscriptionStatus === "active" ? (
              <Badge className="text-xs bg-primary/10 text-primary border-transparent">
                Pro
              </Badge>
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
            <p className="app-score text-2xl font-bold text-foreground leading-none">{value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">
              {label}
            </p>
          </Card>
        ))}
      </div>

      {/* Streak callout */}
      {user.currentStreak > 0 && (
        <Card className="gap-0 py-0">
          <div className="flex items-center gap-4 px-5 py-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(0,240,181,0.08)" }}
            >
              <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-primary">
                <path d="M10 2C10 2 5 7 5 11a5 5 0 0010 0c0-2-1.5-3.5-2.5-4.5C11.5 5.5 12 4 12 4S10.5 5.5 10 6C9 5 10 2 10 2z" fill="currentColor" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{user.currentStreak}-week streak</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Trained 3+ days/week. Best ever: {user.longestStreak}w
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Activity heatmap */}
      <Card className="gap-0 py-0">
        <CardHeader className="pb-0">
          <CardTitle className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-[3px]">
            {days.map(({ key, score }) => {
              const bg =
                score === 0
                  ? "var(--bg-overlay)"
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
                  className="w-3 h-3 rounded-[3px]"
                  style={{ background: bg, opacity: score === 0 ? 0.25 : 0.6 + score / 250 }}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {[
              ["Rest", "var(--bg-overlay)"],
              ["Moderate", "#64748B"],
              ["Solid", "#A78BFA"],
              ["Great", "#00F0B5"],
              ["Elite", "#FFD700"],
            ].map(([l, c]) => (
              <div key={l} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c as string, opacity: 0.7 }} />
                <span className="text-[10px] text-muted-foreground">{l}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personal bests */}
      {topPBs.length > 0 && (
        <Card className="gap-0 py-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">Personal Bests</CardTitle>
          </CardHeader>
          <CardContent>
            {topPBs.map(([activity, { score, date }], i) => {
              const color = getScoreColor(score);
              return (
                <div key={activity}>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-foreground truncate mr-3">{activity}</span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge
                        className="text-sm font-bold border-transparent"
                        style={{ background: `${color}12`, color }}
                      >
                        {score}
                      </Badge>
                      <span className="text-xs text-muted-foreground w-16 text-right">
                        {new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </div>
                  {i < topPBs.length - 1 && <Separator />}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Connected accounts */}
      <Card className="gap-0 py-0">
        <CardHeader className="pb-0">
          <CardTitle className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">Connected</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountRow name="Strava" connected={user.stravaConnected} onConnect={handleStravaConnect} />
          <Separator />
          <AccountRow name="Garmin" connected={false} soon />
        </CardContent>
      </Card>

      {/* Groups */}
      {groups.length > 0 && (
        <Card className="gap-0 py-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">Groups</CardTitle>
          </CardHeader>
          <CardContent>
            {groups.map((g, i) => (
              <div key={g._id}>
                <a
                  href="/dashboard/group-settings"
                  className="flex items-center justify-between py-3 hover:opacity-70 transition-opacity"
                >
                  <span className="text-sm text-foreground truncate mr-3">{g.name}</span>
                  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-muted-foreground flex-shrink-0">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </a>
                {i < groups.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Settings links */}
      <Card className="gap-0 py-0">
        <CardContent>
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
                <span className="text-sm text-muted-foreground">{label}</span>
                <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-muted-foreground flex-shrink-0">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </a>
              {i < arr.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sign out */}
      {onSignOut && (
        <Button
          onClick={onSignOut}
          variant="destructive"
          className="w-full"
          size="lg"
        >
          Sign Out
        </Button>
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
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-sm text-foreground">{name}</span>
        {soon && (
          <Badge variant="secondary" className="text-[10px] border-transparent">
            Coming soon
          </Badge>
        )}
      </div>
      {!soon && (
        <Button
          onClick={connected ? undefined : onConnect}
          disabled={connected}
          variant={connected ? "default" : "secondary"}
          size="sm"
          className={connected ? "bg-primary/10 text-primary hover:bg-primary/10" : ""}
        >
          {connected ? "Connected" : "Connect"}
        </Button>
      )}
    </div>
  );
}
