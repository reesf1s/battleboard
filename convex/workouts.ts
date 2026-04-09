import { v } from "convex/values";
import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

function getWeekId(date: Date = new Date()): string {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export const create = mutation({
  args: {
    userId: v.id("users"),
    activityType: v.string(),
    durationMinutes: v.number(),
    distanceKm: v.optional(v.number()),
    avgHeartRate: v.optional(v.number()),
    maxHeartRate: v.optional(v.number()),
    elevationGainM: v.optional(v.number()),
    calories: v.optional(v.number()),
    rpeSelfReported: v.optional(v.number()),
    userNote: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    startedAt: v.number(),
    source: v.union(
      v.literal("strava"),
      v.literal("garmin"),
      v.literal("apple_health"),
      v.literal("manual")
    ),
    externalId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate inputs
    if (args.durationMinutes < 1 || args.durationMinutes > 1440) {
      throw new Error("Duration must be between 1 and 1440 minutes");
    }
    if (args.activityType.length < 1 || args.activityType.length > 50) {
      throw new Error("Invalid activity type");
    }
    if (args.rpeSelfReported !== undefined && (args.rpeSelfReported < 1 || args.rpeSelfReported > 10)) {
      throw new Error("RPE must be between 1 and 10");
    }
    if (args.distanceKm !== undefined && (args.distanceKm < 0 || args.distanceKm > 1000)) {
      throw new Error("Invalid distance");
    }

    const weekId = getWeekId(new Date(args.startedAt));

    const workoutId = await ctx.db.insert("workouts", {
      ...args,
      weekId,
      effortScore: 0,
      aiReasoning: "",
      aiSummary: "",
      intensityScore: 0,
      durationScore: 0,
      consistencyBonus: 0,
      personalEffortScore: 0,
      scored: false,
      createdAt: Date.now(),
    });

    // Trigger AI scoring
    await ctx.scheduler.runAfter(0, internal.ai.scoreWorkout, { workoutId });

    return workoutId;
  },
});

export const getForScoring = internalQuery({
  args: { workoutId: v.id("workouts") },
  handler: async (ctx, args) => {
    const workout = await ctx.db.get(args.workoutId);
    if (!workout) throw new Error("Workout not found");
    return workout;
  },
});

export const applyScore = internalMutation({
  args: {
    workoutId: v.id("workouts"),
    effortScore: v.number(),
    aiReasoning: v.string(),
    aiSummary: v.string(),
    intensityScore: v.number(),
    durationScore: v.number(),
    consistencyBonus: v.number(),
    personalEffortScore: v.number(),
  },
  handler: async (ctx, args) => {
    const { workoutId, ...scores } = args;
    await ctx.db.patch(workoutId, { ...scores, scored: true });

    const workout = await ctx.db.get(workoutId);
    if (!workout) return;

    // Update weekly scores for all groups this user is in
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", workout.userId))
      .collect();

    for (const membership of memberships) {
      await ctx.scheduler.runAfter(0, internal.weeklyScores.recalculate, {
        userId: workout.userId,
        groupId: membership.groupId,
        weekId: workout.weekId,
      });
    }

    // Update user stats
    await ctx.scheduler.runAfter(0, internal.users.recalculateStats, {
      userId: workout.userId,
    });
  },
});

export const getGroupFeed = query({
  args: {
    groupId: v.id("groups"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    const memberIds = memberships.map((m) => m.userId);

    // Get recent workouts from all members
    const allWorkouts = await Promise.all(
      memberIds.map((userId) =>
        ctx.db
          .query("workouts")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .order("desc")
          .take(10)
      )
    );

    const workouts = allWorkouts
      .flat()
      .filter((w) => w.scored)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);

    // Fetch user info for each workout
    const withUsers = await Promise.all(
      workouts.map(async (workout) => {
        const user = await ctx.db.get(workout.userId);
        const reactions = await ctx.db
          .query("reactions")
          .withIndex("by_workout", (q) => q.eq("workoutId", workout._id))
          .collect();
        return { ...workout, user, reactions };
      })
    );

    return withUsers;
  },
});

export const getUserWorkouts = query({
  args: { userId: v.id("users"), weekId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.weekId) {
      const weekId = args.weekId;
      return await ctx.db
        .query("workouts")
        .withIndex("by_user_and_week", (q) =>
          q.eq("userId", args.userId).eq("weekId", weekId)
        )
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("workouts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

export const getById = query({
  args: { workoutId: v.id("workouts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.workoutId);
  },
});

export const createFromAppleHealth = internalMutation({
  args: {
    userId: v.id("users"),
    externalId: v.optional(v.string()),
    activityType: v.string(),
    durationMinutes: v.number(),
    distanceKm: v.optional(v.number()),
    avgHeartRate: v.optional(v.number()),
    maxHeartRate: v.optional(v.number()),
    elevationGainM: v.optional(v.number()),
    calories: v.optional(v.number()),
    userNote: v.optional(v.string()),
    startedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Deduplicate by external ID if provided
    if (args.externalId) {
      const existing = await ctx.db
        .query("workouts")
        .withIndex("by_external_id", (q) => q.eq("externalId", args.externalId))
        .unique();
      if (existing) return existing._id;
    }

    const weekId = getWeekId(new Date(args.startedAt));

    const workoutId = await ctx.db.insert("workouts", {
      ...args,
      source: "apple_health",
      weekId,
      effortScore: 0,
      aiReasoning: "",
      aiSummary: "",
      intensityScore: 0,
      durationScore: 0,
      consistencyBonus: 0,
      personalEffortScore: 0,
      scored: false,
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.ai.scoreWorkout, { workoutId });
    return workoutId;
  },
});

export const createFromStrava = internalMutation({
  args: {
    userId: v.id("users"),
    externalId: v.string(),
    activityType: v.string(),
    durationMinutes: v.number(),
    distanceKm: v.optional(v.number()),
    avgHeartRate: v.optional(v.number()),
    maxHeartRate: v.optional(v.number()),
    elevationGainM: v.optional(v.number()),
    calories: v.optional(v.number()),
    userNote: v.optional(v.string()),
    startedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Deduplicate by external ID
    const existing = await ctx.db
      .query("workouts")
      .withIndex("by_external_id", (q) => q.eq("externalId", args.externalId))
      .unique();
    if (existing) return existing._id;

    const weekId = getWeekId(new Date(args.startedAt));

    const workoutId = await ctx.db.insert("workouts", {
      ...args,
      source: "strava",
      weekId,
      effortScore: 0,
      aiReasoning: "",
      aiSummary: "",
      intensityScore: 0,
      durationScore: 0,
      consistencyBonus: 0,
      personalEffortScore: 0,
      scored: false,
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.ai.scoreWorkout, { workoutId });
    return workoutId;
  },
});
