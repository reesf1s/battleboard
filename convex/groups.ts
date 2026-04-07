import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const create = mutation({
  args: {
    name: v.string(),
    emoji: v.optional(v.string()),
    weeklyStakes: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    let inviteCode = generateInviteCode();
    // Ensure uniqueness
    while (
      await ctx.db
        .query("groups")
        .withIndex("by_invite_code", (q) => q.eq("inviteCode", inviteCode))
        .unique()
    ) {
      inviteCode = generateInviteCode();
    }

    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      emoji: args.emoji,
      ownerId: args.userId,
      inviteCode,
      weeklyStakes: args.weeklyStakes,
      memberCount: 1,
      createdAt: Date.now(),
    });

    await ctx.db.insert("groupMembers", {
      groupId,
      userId: args.userId,
      joinedAt: Date.now(),
    });

    return { groupId, inviteCode };
  },
});

export const join = mutation({
  args: {
    inviteCode: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db
      .query("groups")
      .withIndex("by_invite_code", (q) =>
        q.eq("inviteCode", args.inviteCode.toUpperCase())
      )
      .unique();

    if (!group) throw new Error("Invalid invite code");

    const existing = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", group._id).eq("userId", args.userId)
      )
      .unique();

    if (existing) return group._id;

    if (group.memberCount >= 20) throw new Error("Group is full (max 20 members)");

    await ctx.db.insert("groupMembers", {
      groupId: group._id,
      userId: args.userId,
      joinedAt: Date.now(),
    });

    await ctx.db.patch(group._id, { memberCount: group.memberCount + 1 });

    return group._id;
  },
});

export const getUserGroups = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const groups = await Promise.all(
      memberships.map(async (m) => {
        const group = await ctx.db.get(m.groupId);
        return group;
      })
    );

    return groups.filter(Boolean);
  },
});

export const getGroupWithMembers = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) return null;

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    const members = await Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return user ? { ...user, joinedAt: m.joinedAt } : null;
      })
    );

    return { ...group, members: members.filter(Boolean) };
  },
});

export const updateStakes = mutation({
  args: {
    groupId: v.id("groups"),
    weeklyStakes: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");
    if (group.ownerId !== args.userId) throw new Error("Only the owner can update stakes");
    await ctx.db.patch(args.groupId, { weeklyStakes: args.weeklyStakes });
  },
});

export const removeMember = mutation({
  args: {
    groupId: v.id("groups"),
    targetUserId: v.id("users"),
    requestingUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");
    if (group.ownerId !== args.requestingUserId)
      throw new Error("Only the owner can remove members");

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.targetUserId)
      )
      .unique();

    if (membership) {
      await ctx.db.delete(membership._id);
      await ctx.db.patch(args.groupId, {
        memberCount: Math.max(0, group.memberCount - 1),
      });
    }
  },
});

export const leaveGroup = mutation({
  args: { groupId: v.id("groups"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .unique();

    if (membership) {
      await ctx.db.delete(membership._id);
      await ctx.db.patch(args.groupId, {
        memberCount: Math.max(0, group.memberCount - 1),
      });
    }
  },
});

export const getByInviteCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("groups")
      .withIndex("by_invite_code", (q) =>
        q.eq("inviteCode", args.inviteCode.toUpperCase())
      )
      .unique();
  },
});

export const updateGroup = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.optional(v.string()),
    emoji: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");
    if (group.ownerId !== args.userId) throw new Error("Only the owner can edit");
    const { groupId, userId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(groupId, filtered);
  },
});
