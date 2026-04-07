import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";

export const save = internalMutation({
  args: {
    groupId: v.id("groups"),
    weekId: v.string(),
    narrative: v.string(),
    winnerId: v.id("users"),
    loserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("weeklyNarratives")
      .withIndex("by_group_and_week", (q) =>
        q.eq("groupId", args.groupId).eq("weekId", args.weekId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { narrative: args.narrative });
    } else {
      await ctx.db.insert("weeklyNarratives", {
        ...args,
        createdAt: Date.now(),
      });
    }
  },
});

export const getForGroup = query({
  args: { groupId: v.id("groups"), weekId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("weeklyNarratives")
      .withIndex("by_group_and_week", (q) =>
        q.eq("groupId", args.groupId).eq("weekId", args.weekId)
      )
      .unique();
  },
});
