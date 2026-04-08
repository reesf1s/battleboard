import { v } from "convex/values";
import { mutation, query, internalQuery, internalMutation } from "./_generated/server";

export const getOrCreate = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) return existing._id;

    const now = Date.now();
    const trialEnd = now + 7 * 24 * 60 * 60 * 1000; // 7 days

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      avatarUrl: args.avatarUrl,
      stravaConnected: false,
      garminConnected: false,
      appleHealthConnected: false,
      fitnessLevel: "intermediate",
      typicalActivities: [],
      avgWeeklyWorkouts: 0,
      currentStreak: 0,
      longestStreak: 0,
      subscriptionStatus: "trial",
      subscriptionExpiresAt: trialEnd,
      trialStartedAt: now,
      createdAt: now,
    });
  },
});

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Internal version for server-side actions (e.g. Strava sync)
export const getByIdInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getScoringContext = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Get recent scores
    const recentWorkouts = await ctx.db
      .query("workouts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10);

    const recentScores = recentWorkouts
      .filter((w) => w.scored)
      .map((w) => w.effortScore);

    return {
      avg_weekly_workouts: user.avgWeeklyWorkouts,
      typical_activities: user.typicalActivities,
      recent_scores: recentScores,
      fitness_level: user.fitnessLevel,
    };
  },
});

export const updateSubscription = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(
      v.literal("trial"),
      v.literal("active"),
      v.literal("expired"),
      v.literal("none")
    ),
    expiresAt: v.optional(v.number()),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      subscriptionStatus: args.status,
      subscriptionExpiresAt: args.expiresAt,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
    });
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    typicalActivities: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(userId, filtered);
  },
});

export const updateStats = mutation({
  args: {
    userId: v.id("users"),
    avgWeeklyWorkouts: v.number(),
    typicalActivities: v.array(v.string()),
    fitnessLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
    currentStreak: v.number(),
    longestStreak: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    await ctx.db.patch(userId, updates);
  },
});

export const recalculateStats = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;

    const allWorkouts = await ctx.db
      .query("workouts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("scored"), true))
      .collect();

    // Calculate avg weekly workouts (last 8 weeks)
    const now = Date.now();
    const eightWeeksAgo = now - 8 * 7 * 24 * 60 * 60 * 1000;
    const recentWorkouts = allWorkouts.filter((w) => w.startedAt > eightWeeksAgo);
    const avgWeeklyWorkouts = recentWorkouts.length / 8;

    // Calculate typical activities
    const activityCounts: Record<string, number> = {};
    allWorkouts.forEach((w) => {
      activityCounts[w.activityType] = (activityCounts[w.activityType] || 0) + 1;
    });
    const typicalActivities = Object.entries(activityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type]) => type);

    // Calculate fitness level
    const avgScore =
      allWorkouts.length > 0
        ? allWorkouts.reduce((s, w) => s + w.effortScore, 0) / allWorkouts.length
        : 0;
    const fitnessLevel =
      avgScore >= 75 ? "advanced" : avgScore >= 55 ? "intermediate" : "beginner";

    // Calculate streak (consecutive weeks with 3+ workouts)
    // Simplified: count consecutive weeks
    const workoutsByWeek: Record<string, number> = {};
    allWorkouts.forEach((w) => {
      workoutsByWeek[w.weekId] = (workoutsByWeek[w.weekId] || 0) + 1;
    });

    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 52; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i * 7);
      const year = d.getFullYear();
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
      const weekId = `${year}-W${String(weekNo).padStart(2, "0")}`;
      if ((workoutsByWeek[weekId] || 0) >= 3) {
        currentStreak++;
      } else {
        break;
      }
    }

    const longestStreak = Math.max(user.longestStreak, currentStreak);

    await ctx.db.patch(args.userId, {
      avgWeeklyWorkouts,
      typicalActivities,
      fitnessLevel: fitnessLevel as "beginner" | "intermediate" | "advanced",
      currentStreak,
      longestStreak,
    });
  },
});

// Public version for Strava OAuth callback (server-to-server)
export const connectStrava = mutation({
  args: {
    userId: v.id("users"),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiresAt: v.number(),
    athleteId: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      stravaConnected: true,
      stravaAccessToken: args.accessToken,
      stravaRefreshToken: args.refreshToken,
      stravaTokenExpiresAt: args.expiresAt,
      stravaAthleteId: args.athleteId,
    });
  },
});

export const findByStravaAthleteId = internalQuery({
  args: { athleteId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_strava_athlete", (q) => q.eq("stravaAthleteId", args.athleteId))
      .unique();
  },
});

export const updateStravaTokens = internalMutation({
  args: {
    userId: v.id("users"),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiresAt: v.number(),
    athleteId: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      stravaConnected: true,
      stravaAccessToken: args.accessToken,
      stravaRefreshToken: args.refreshToken,
      stravaTokenExpiresAt: args.expiresAt,
      stravaAthleteId: args.athleteId,
    });
  },
});
