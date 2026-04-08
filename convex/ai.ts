import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";

const SCORING_SYSTEM_PROMPT = `You are Battleboard's AI workout scorer. You evaluate any physical activity and assign a fair effort score from 0-100.

SCORING PRINCIPLES:
- A typical solid workout = 60-75 points
- Exceptional effort (PBs, extreme duration, very high intensity) = 80-95
- Light activity (gentle walk, easy stretch) = 15-35
- Score is RELATIVE TO THE INDIVIDUAL — a beginner's achievement matters as much as an advanced athlete's
- Heart rate data is the strongest signal of true effort. Zone 4-5 work scores significantly higher than Zone 1-2
- Duration matters but with diminishing returns — a 2hr walk shouldn't outscore a 45min HIIT session
- No sport bias. Yoga, walking, snowboarding, boxing, gym, running — all valid. Score the EFFORT not the activity type
- A PB or notable achievement (user mentions in note) deserves recognition and a scoring bump
- Early morning (before 7am) or late night (after 9pm) sessions get a tiny consistency bonus
- If data is sparse (no HR, no distance), be conservative and lean on duration + activity type + RPE

REASONING STYLE:
- Be conversational, specific, and reference actual data points from the workout
- Sound like a knowledgeable training partner, not a robot
- Keep it to 2-3 sentences max
- Include one specific callout (pace, HR, duration, PB, etc)
- Light humour is fine but don't force it
- Never condescending, never generic

SUMMARY STYLE:
- One line format: "32min tempo run · 5.1km · avg HR 162 · strong effort 💪"
- Use relevant emoji
- Include the most important 2-3 data points

Return JSON only. No markdown. No preamble.`;

export const scoreWorkout = internalAction({
  args: { workoutId: v.id("workouts") },
  handler: async (ctx, args) => {
    const workout = await ctx.runQuery(internal.workouts.getForScoring, {
      workoutId: args.workoutId,
    });
    const userContext = await ctx.runQuery(internal.users.getScoringContext, {
      userId: workout.userId,
    });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const timeOfDay = new Date(workout.startedAt).toTimeString().slice(0, 5);

    const response = await openai.chat.completions.create({
      model: "gpt-5.4-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SCORING_SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            workout: {
              activity_type: workout.activityType,
              duration_minutes: workout.durationMinutes,
              distance_km: workout.distanceKm ?? null,
              avg_heart_rate_bpm: workout.avgHeartRate ?? null,
              max_heart_rate_bpm: workout.maxHeartRate ?? null,
              elevation_gain_m: workout.elevationGainM ?? null,
              calories: workout.calories ?? null,
              rpe_self_reported: workout.rpeSelfReported ?? null,
              user_note: workout.userNote ?? null,
              time_of_day: timeOfDay,
            },
            user_context: userContext,
          }),
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    let result;
    try {
      result = JSON.parse(response.choices[0].message.content || "{}");
    } catch {
      result = {
        effort_score: 60,
        reasoning: "Solid workout logged. Keep it up!",
        summary: `${workout.durationMinutes}min ${workout.activityType} · effort logged 💪`,
        breakdown: {
          intensity: 6,
          duration: 6,
          consistency_bonus: 0,
          personal_effort: 6,
        },
      };
    }

    await ctx.runMutation(internal.workouts.applyScore, {
      workoutId: args.workoutId,
      effortScore: Math.round(Math.max(0, Math.min(100, result.effort_score || 60))),
      aiReasoning: result.reasoning || "",
      aiSummary: result.summary || "",
      intensityScore: result.breakdown?.intensity || 6,
      durationScore: result.breakdown?.duration || 6,
      consistencyBonus: result.breakdown?.consistency_bonus || 0,
      personalEffortScore: result.breakdown?.personal_effort || 6,
    });
  },
});

export const generateWeeklyNarrative = action({
  args: {
    groupId: v.id("groups"),
    weekId: v.string(),
  },
  handler: async (ctx, args) => {
    const leaderboard = await ctx.runQuery(
      internal.weeklyScores.getLeaderboardInternal,
      { groupId: args.groupId, weekId: args.weekId }
    );

    if (leaderboard.length === 0) return null;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Generate a witty, competitive weekly fitness competition summary for a friend group.

Leaderboard data:
${leaderboard.map((entry, i) =>
  `${i + 1}. ${entry.user?.name}: ${entry.totalScore} points, ${entry.workoutCount} workouts, best session: ${entry.topWorkoutSummary}`
).join('\n')}

Write 3-5 sentences. Be competitive and banter-y. Crown the winner. Lightly roast the bottom performer. Reference specific scores and workout details. Use a emoji or two. Sound like a mate, not a robot.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.4-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 300,
    });

    const narrative = response.choices[0].message.content || "";
    const winner = leaderboard[0];
    const loser = leaderboard[leaderboard.length - 1];

    await ctx.runMutation(internal.weeklyNarratives.save, {
      groupId: args.groupId,
      weekId: args.weekId,
      narrative,
      winnerId: winner.userId,
      loserId: loser.userId,
    });

    return narrative;
  },
});

export const generateGameplan = action({
  args: {
    userId: v.id("users"),
    groupId: v.id("groups"),
    weekId: v.string(),
  },
  handler: async (ctx, args) => {
    const leaderboard = await ctx.runQuery(
      internal.weeklyScores.getLeaderboardInternal,
      { groupId: args.groupId, weekId: args.weekId }
    );

    const userContext = await ctx.runQuery(internal.users.getScoringContext, {
      userId: args.userId,
    });

    const userScore = leaderboard.find((e) => e.userId === args.userId);
    const userRank = leaderboard.findIndex((e) => e.userId === args.userId) + 1;
    const topScore = leaderboard[0]?.totalScore || 0;
    const gap = topScore - (userScore?.totalScore || 0);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `You are a competitive fitness coach helping someone win their friend group leaderboard.

Current standings:
- User rank: ${userRank} of ${leaderboard.length}
- User score: ${userScore?.totalScore || 0} points
- Leader score: ${topScore} points
- Gap to 1st: ${gap} points
- User's typical activities: ${userContext.typical_activities.join(", ")}
- User's recent scores: ${userContext.recent_scores.join(", ")}
- Fitness level: ${userContext.fitness_level}

Write a 3-4 sentence motivating game plan for the week. Be specific — mention score estimates, suggest activity types based on their history, and explain tactically how they can win or close the gap. Competitive and direct. End with a predicted points target.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.4-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 250,
    });

    const recommendation = response.choices[0].message.content || "";
    const predictedScoreNeeded = Math.round(topScore * 1.1);

    await ctx.runMutation(internal.weeklyGameplans.save, {
      userId: args.userId,
      groupId: args.groupId,
      weekId: args.weekId,
      recommendation,
      predictedScoreNeeded,
    });

    return { recommendation, predictedScoreNeeded };
  },
});
