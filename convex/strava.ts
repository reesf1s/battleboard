import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal, api } from "./_generated/api";

const STRAVA_TYPE_MAP: Record<string, string> = {
  Run: "Running",
  Ride: "Cycling",
  Swim: "Swimming",
  Walk: "Walking",
  Hike: "Hiking",
  WeightTraining: "Gym (Strength)",
  Workout: "Gym (Cardio)",
  Yoga: "Yoga/Pilates",
  Boxing: "Boxing/MMA",
  Crossfit: "HIIT/CrossFit",
  Rowing: "Rowing",
  Soccer: "Team Sports",
  Football: "Team Sports",
  Rugby: "Team Sports",
  Basketball: "Team Sports",
  Tennis: "Team Sports",
  Snowboard: "Snowboarding/Skiing",
  AlpineSki: "Snowboarding/Skiing",
  RockClimbing: "Climbing",
  Dance: "Dance",
};

export const syncActivities = action({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getById, {
      userId: args.userId,
    });
    if (!user?.stravaAccessToken) return { synced: 0 };

    let accessToken = user.stravaAccessToken;
    if (user.stravaTokenExpiresAt && Date.now() > user.stravaTokenExpiresAt * 1000) {
      const refreshed = await refreshStravaToken(user.stravaRefreshToken!);
      if (refreshed) {
        await ctx.runMutation(internal.users.updateStravaTokens, {
          userId: args.userId,
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token,
          expiresAt: refreshed.expires_at,
          athleteId: user.stravaAthleteId!,
        });
        accessToken = refreshed.access_token;
      }
    }

    const after = Math.floor((Date.now() - 14 * 24 * 60 * 60 * 1000) / 1000);
    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=50`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) return { synced: 0 };

    const activities = await response.json();
    let synced = 0;

    for (const activity of activities) {
      const activityType = STRAVA_TYPE_MAP[activity.type] || activity.type || "Other";
      await ctx.runMutation(internal.workouts.createFromStrava, {
        userId: args.userId,
        externalId: `strava-${activity.id}`,
        activityType,
        durationMinutes: Math.round(activity.moving_time / 60),
        distanceKm: activity.distance ? activity.distance / 1000 : undefined,
        avgHeartRate: activity.average_heartrate || undefined,
        maxHeartRate: activity.max_heartrate || undefined,
        elevationGainM: activity.total_elevation_gain || undefined,
        calories: activity.calories || undefined,
        userNote: activity.name !== activityType ? activity.name : undefined,
        startedAt: new Date(activity.start_date).getTime(),
      });
      synced++;
    }

    return { synced };
  },
});

export const handleWebhookEvent = internalAction({
  args: { athleteId: v.number(), activityId: v.number() },
  handler: async (ctx, args) => {
    // Find user by strava athlete ID
    const users = await ctx.runQuery(internal.users.findByStravaAthleteId, {
      athleteId: args.athleteId,
    });
    if (!users) return;

    await ctx.runAction(api.strava.syncActivities, { userId: users._id });
  },
});

async function refreshStravaToken(refreshToken: string) {
  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  if (!response.ok) return null;
  return response.json();
}
