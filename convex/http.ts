import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// Strava webhook verification
http.route({
  path: "/strava/webhook",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === process.env.STRAVA_WEBHOOK_VERIFY_TOKEN) {
      return new Response(JSON.stringify({ "hub.challenge": challenge }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response("Forbidden", { status: 403 });
  }),
});

// Strava webhook events
http.route({
  path: "/strava/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const event = await req.json();

    // Only handle new activities
    if (event.aspect_type === "create" && event.object_type === "activity") {
      const athleteId = event.owner_id;
      // Find user by strava athlete ID and sync
      await ctx.scheduler.runAfter(0, internal.strava.handleWebhookEvent, {
        athleteId,
        activityId: event.object_id,
      });
    }

    return new Response("OK", { status: 200 });
  }),
});

// Apple Health workout sync via Apple Shortcuts
const APPLE_HEALTH_ACTIVITY_MAP: Record<string, string> = {
  "HKWorkoutActivityTypeRunning": "Running",
  "HKWorkoutActivityTypeCycling": "Cycling",
  "HKWorkoutActivityTypeSwimming": "Swimming",
  "HKWorkoutActivityTypeWalking": "Walking",
  "HKWorkoutActivityTypeHiking": "Hiking",
  "HKWorkoutActivityTypeYoga": "Yoga",
  "HKWorkoutActivityTypeFunctionalStrengthTraining": "Gym (Strength)",
  "HKWorkoutActivityTypeTraditionalStrengthTraining": "Gym (Strength)",
  "HKWorkoutActivityTypeHighIntensityIntervalTraining": "HIIT",
  "HKWorkoutActivityTypeCrossTraining": "CrossFit",
  "HKWorkoutActivityTypePilates": "Pilates",
  "HKWorkoutActivityTypeElliptical": "Elliptical",
  "HKWorkoutActivityTypeRowing": "Rowing",
  "HKWorkoutActivityTypeDance": "Dance",
  "HKWorkoutActivityTypeBoxing": "Boxing",
  "HKWorkoutActivityTypeMartialArts": "Martial Arts",
  "HKWorkoutActivityTypeClimbing": "Climbing",
  "HKWorkoutActivityTypeSkatingSports": "Skating",
  "HKWorkoutActivityTypeSnowSports": "Snowboarding",
  "HKWorkoutActivityTypeTennis": "Tennis",
  "HKWorkoutActivityTypeBadminton": "Badminton",
  "HKWorkoutActivityTypeSoccer": "Football",
  "HKWorkoutActivityTypeBasketball": "Basketball",
  "HKWorkoutActivityTypeCooldown": "Cooldown",
  "HKWorkoutActivityTypeCoreTraining": "Core Training",
};

http.route({
  path: "/apple-health/sync",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    // CORS headers for Apple Shortcuts
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    };

    try {
      const body = await req.json();
      const token = body.token || req.headers.get("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return new Response(
          JSON.stringify({ error: "Missing authentication token" }),
          { status: 401, headers: corsHeaders }
        );
      }

      // Look up user by sync token
      const user = await ctx.runQuery(internal.users.findByAppleHealthToken, { token });
      if (!user) {
        return new Response(
          JSON.stringify({ error: "Invalid sync token" }),
          { status: 401, headers: corsHeaders }
        );
      }

      // Parse workout data from Apple Shortcuts
      const {
        activity_type,
        activityType: activityTypeAlt,
        duration, // seconds from Apple Health
        duration_minutes,
        distance, // meters from Apple Health
        distance_km,
        avg_heart_rate,
        max_heart_rate,
        calories: rawCalories,
        elevation,
        note,
        started_at,
        startedAt: startedAtAlt,
        external_id,
      } = body;

      // Resolve activity type — support HK constants, plain names, or fallback
      const rawType = activity_type || activityTypeAlt || "Workout";
      const activityType = APPLE_HEALTH_ACTIVITY_MAP[rawType] || rawType;

      // Resolve duration (accept seconds or minutes)
      let durationMinutes = duration_minutes;
      if (!durationMinutes && duration) {
        durationMinutes = Math.round(Number(duration) / 60);
      }
      if (!durationMinutes || durationMinutes < 1) {
        return new Response(
          JSON.stringify({ error: "Duration is required (duration_minutes or duration in seconds)" }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Resolve distance (accept meters or km)
      let distanceKm = distance_km;
      if (!distanceKm && distance) {
        distanceKm = Math.round((Number(distance) / 1000) * 100) / 100;
      }

      // Resolve started_at timestamp
      let startedAt: number;
      const rawStartedAt = started_at || startedAtAlt;
      if (rawStartedAt) {
        startedAt = typeof rawStartedAt === "number" ? rawStartedAt : new Date(rawStartedAt).getTime();
      } else {
        startedAt = Date.now();
      }

      if (isNaN(startedAt)) {
        startedAt = Date.now();
      }

      const workoutId = await ctx.runMutation(internal.workouts.createFromAppleHealth, {
        userId: user._id,
        externalId: external_id ? `apple-health-${external_id}` : undefined,
        activityType,
        durationMinutes: Math.min(1440, Math.max(1, Math.round(durationMinutes))),
        distanceKm: distanceKm ? Math.round(distanceKm * 100) / 100 : undefined,
        avgHeartRate: avg_heart_rate ? Math.round(Number(avg_heart_rate)) : undefined,
        maxHeartRate: max_heart_rate ? Math.round(Number(max_heart_rate)) : undefined,
        elevationGainM: elevation ? Math.round(Number(elevation)) : undefined,
        calories: rawCalories ? Math.round(Number(rawCalories)) : undefined,
        userNote: note || undefined,
        startedAt,
      });

      return new Response(
        JSON.stringify({
          success: true,
          workoutId,
          message: `${activityType} workout logged (${durationMinutes}min)`,
        }),
        { status: 200, headers: corsHeaders }
      );
    } catch (err: any) {
      console.error("Apple Health sync error:", err);
      return new Response(
        JSON.stringify({ error: "Failed to sync workout", detail: err?.message }),
        { status: 500, headers: corsHeaders }
      );
    }
  }),
});

// CORS preflight for Apple Health endpoint
http.route({
  path: "/apple-health/sync",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

export default http;
