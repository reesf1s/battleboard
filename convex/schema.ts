import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    stravaConnected: v.boolean(),
    garminConnected: v.boolean(),
    appleHealthConnected: v.boolean(),
    stravaAccessToken: v.optional(v.string()),
    stravaRefreshToken: v.optional(v.string()),
    stravaTokenExpiresAt: v.optional(v.number()),
    stravaAthleteId: v.optional(v.number()),
    fitnessLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
    typicalActivities: v.array(v.string()),
    avgWeeklyWorkouts: v.number(),
    currentStreak: v.number(),
    longestStreak: v.number(),
    subscriptionStatus: v.union(
      v.literal("trial"),
      v.literal("active"),
      v.literal("expired"),
      v.literal("none")
    ),
    subscriptionExpiresAt: v.optional(v.number()),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    trialStartedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_strava_athlete", ["stravaAthleteId"])
    .index("by_subscription", ["subscriptionStatus"])
    .index("by_stripe_customer", ["stripeCustomerId"]),

  groups: defineTable({
    name: v.string(),
    emoji: v.optional(v.string()),
    ownerId: v.id("users"),
    inviteCode: v.string(),
    weeklyStakes: v.optional(v.string()),
    memberCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_invite_code", ["inviteCode"])
    .index("by_owner", ["ownerId"]),

  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    joinedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_and_user", ["groupId", "userId"]),

  workouts: defineTable({
    userId: v.id("users"),
    source: v.union(
      v.literal("strava"),
      v.literal("garmin"),
      v.literal("apple_health"),
      v.literal("manual")
    ),
    externalId: v.optional(v.string()),
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
    effortScore: v.number(),
    aiReasoning: v.string(),
    aiSummary: v.string(),
    intensityScore: v.number(),
    durationScore: v.number(),
    consistencyBonus: v.number(),
    personalEffortScore: v.number(),
    weekId: v.string(),
    scored: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_week", ["userId", "weekId"])
    .index("by_week", ["weekId"])
    .index("by_external_id", ["externalId"]),

  weeklyScores: defineTable({
    userId: v.id("users"),
    groupId: v.id("groups"),
    weekId: v.string(),
    totalScore: v.number(),
    workoutCount: v.number(),
    topWorkoutScore: v.number(),
    topWorkoutSummary: v.string(),
    rank: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_group_and_week", ["groupId", "weekId"])
    .index("by_user_and_week", ["userId", "weekId"]),

  weeklyNarratives: defineTable({
    groupId: v.id("groups"),
    weekId: v.string(),
    narrative: v.string(),
    winnerId: v.id("users"),
    loserId: v.id("users"),
    createdAt: v.number(),
  }).index("by_group_and_week", ["groupId", "weekId"]),

  reactions: defineTable({
    workoutId: v.id("workouts"),
    userId: v.id("users"),
    emoji: v.union(
      v.literal("fire"),
      v.literal("respect"),
      v.literal("laugh")
    ),
    createdAt: v.number(),
  })
    .index("by_workout", ["workoutId"])
    .index("by_user_and_workout", ["userId", "workoutId"]),

  weeklyGameplans: defineTable({
    userId: v.id("users"),
    groupId: v.id("groups"),
    weekId: v.string(),
    recommendation: v.string(),
    predictedScoreNeeded: v.number(),
    createdAt: v.number(),
  }).index("by_user_and_week", ["userId", "weekId"]),
});
