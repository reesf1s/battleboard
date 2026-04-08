import { v } from "convex/values";
import { query, internalMutation, internalQuery } from "./_generated/server";

export const recalculate = internalMutation({
  args: {
    userId: v.id("users"),
    groupId: v.id("groups"),
    weekId: v.string(),
  },
  handler: async (ctx, args) => {
    const workouts = await ctx.db
      .query("workouts")
      .withIndex("by_user_and_week", (q) =>
        q.eq("userId", args.userId).eq("weekId", args.weekId)
      )
      .collect();

    const scoredWorkouts = workouts.filter((w) => w.scored);

    if (scoredWorkouts.length === 0) return;

    const totalScore = scoredWorkouts.reduce((sum, w) => sum + w.effortScore, 0);
    const topWorkout = scoredWorkouts.reduce(
      (top, w) => (w.effortScore > top.effortScore ? w : top),
      scoredWorkouts[0]
    );

    const existing = await ctx.db
      .query("weeklyScores")
      .withIndex("by_user_and_week", (q) =>
        q.eq("userId", args.userId).eq("weekId", args.weekId)
      )
      .filter((q) => q.eq(q.field("groupId"), args.groupId))
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        totalScore,
        workoutCount: scoredWorkouts.length,
        topWorkoutScore: topWorkout.effortScore,
        topWorkoutSummary: topWorkout.aiSummary || topWorkout.activityType,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("weeklyScores", {
        userId: args.userId,
        groupId: args.groupId,
        weekId: args.weekId,
        totalScore,
        workoutCount: scoredWorkouts.length,
        topWorkoutScore: topWorkout.effortScore,
        topWorkoutSummary: topWorkout.aiSummary || topWorkout.activityType,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const getLeaderboardInternal = internalQuery({
  args: { groupId: v.id("groups"), weekId: v.string() },
  handler: async (ctx, args) => {
    const scores = await ctx.db
      .query("weeklyScores")
      .withIndex("by_group_and_week", (q) =>
        q.eq("groupId", args.groupId).eq("weekId", args.weekId)
      )
      .collect();
    const sorted = scores.sort((a, b) => b.totalScore - a.totalScore);
    // Attach user data for AI narrative generation
    const withUsers = await Promise.all(
      sorted.map(async (score) => {
        const user = await ctx.db.get(score.userId);
        return { ...score, user };
      })
    );
    return withUsers;
  },
});

export const getLeaderboard = query({
  args: { groupId: v.id("groups"), weekId: v.string() },
  handler: async (ctx, args) => {
    const scores = await ctx.db
      .query("weeklyScores")
      .withIndex("by_group_and_week", (q) =>
        q.eq("groupId", args.groupId).eq("weekId", args.weekId)
      )
      .collect();

    // Sort by total score descending
    const sorted = scores.sort((a, b) => b.totalScore - a.totalScore);

    // Fetch user details
    const withUsers = await Promise.all(
      sorted.map(async (score, index) => {
        const user = await ctx.db.get(score.userId);
        return { ...score, user, rank: index + 1 };
      })
    );

    return withUsers;
  },
});

export const getPreviousWeekScores = query({
  args: { groupId: v.id("groups"), weekId: v.string() },
  handler: async (ctx, args) => {
    // Parse week ID and get previous
    const [year, week] = args.weekId.split("-W").map(Number);
    let prevWeek = week - 1;
    let prevYear = year;
    if (prevWeek < 1) {
      prevYear -= 1;
      prevWeek = 52;
    }
    const prevWeekId = `${prevYear}-W${String(prevWeek).padStart(2, "0")}`;

    return await ctx.db
      .query("weeklyScores")
      .withIndex("by_group_and_week", (q) =>
        q.eq("groupId", args.groupId).eq("weekId", prevWeekId)
      )
      .collect();
  },
});

export const getUserWeeklyHistory = query({
  args: { userId: v.id("users"), groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const scores = await ctx.db
      .query("weeklyScores")
      .withIndex("by_user_and_week", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("groupId"), args.groupId))
      .order("desc")
      .take(12);
    return scores;
  },
});
