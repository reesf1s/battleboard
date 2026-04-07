import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const toggle = mutation({
  args: {
    workoutId: v.id("workouts"),
    userId: v.id("users"),
    emoji: v.union(v.literal("fire"), v.literal("respect"), v.literal("laugh")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_user_and_workout", (q) =>
        q.eq("userId", args.userId).eq("workoutId", args.workoutId)
      )
      .filter((q) => q.eq(q.field("emoji"), args.emoji))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    } else {
      await ctx.db.insert("reactions", {
        workoutId: args.workoutId,
        userId: args.userId,
        emoji: args.emoji,
        createdAt: Date.now(),
      });
      return true;
    }
  },
});

export const getForWorkout = query({
  args: { workoutId: v.id("workouts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reactions")
      .withIndex("by_workout", (q) => q.eq("workoutId", args.workoutId))
      .collect();
  },
});
