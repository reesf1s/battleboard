import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";

export const save = internalMutation({
  args: {
    userId: v.id("users"),
    groupId: v.id("groups"),
    weekId: v.string(),
    recommendation: v.string(),
    predictedScoreNeeded: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("weeklyGameplans")
      .withIndex("by_user_and_week", (q) =>
        q.eq("userId", args.userId).eq("weekId", args.weekId)
      )
      .filter((q) => q.eq(q.field("groupId"), args.groupId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        recommendation: args.recommendation,
        predictedScoreNeeded: args.predictedScoreNeeded,
      });
    } else {
      await ctx.db.insert("weeklyGameplans", {
        ...args,
        createdAt: Date.now(),
      });
    }
  },
});

export const getForUser = query({
  args: { userId: v.id("users"), weekId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("weeklyGameplans")
      .withIndex("by_user_and_week", (q) =>
        q.eq("userId", args.userId).eq("weekId", args.weekId)
      )
      .order("desc")
      .first();
  },
});
