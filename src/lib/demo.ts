/* ────────────────────────────────────────────────────────────
   Demo mode — provides realistic static data when
   Clerk / Convex aren't configured.
   ──────────────────────────────────────────────────────────── */

export function isDemoMode(): boolean {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";
  const clerkOk =
    (clerkKey.startsWith("pk_live_") || clerkKey.startsWith("pk_test_")) &&
    !clerkKey.includes("placeholder") &&
    !clerkKey.includes("your_key") &&
    clerkKey.length > 30;
  const convexOk =
    convexUrl.includes(".convex.cloud") &&
    !convexUrl.includes("placeholder") &&
    !convexUrl.includes("your-project");
  return !clerkOk || !convexOk;
}

/* ── IDs ── */
const uid = (s: string) => s as any;
const now = Date.now();
const h = (n: number) => now - n * 3600_000;
const d = (n: number) => now - n * 86_400_000;

/* ── Users ── */
export const DEMO_USER = {
  _id: uid("demo_rees"),
  clerkId: "clerk_demo_rees",
  name: "Rees",
  email: "rees@battleboard.app",
  avatarUrl: undefined,
  currentStreak: 3,
  longestStreak: 5,
  avgWeeklyWorkouts: 4.2,
  typicalActivities: ["Gym (Strength)", "Running", "Boxing/MMA"],
  fitnessLevel: "intermediate",
  stravaConnected: true,
  subscriptionStatus: "active" as const,
  subscriptionExpiresAt: undefined,
};

/* ── Groups ── */
export const DEMO_GROUPS = [
  {
    _id: uid("demo_group_1"),
    name: "Saturday Soldiers",
    emoji: undefined,
    weeklyStakes: "Loser buys post-gym shakes",
    ownerId: uid("demo_rees"),
    inviteCode: "BB24X7",
    memberCount: 4,
    createdAt: d(90),
  },
];

/* ── Leaderboard ── */
export const DEMO_LEADERBOARD = [
  {
    _id: uid("ws_1"),
    userId: uid("demo_jake"),
    totalScore: 312,
    workoutCount: 5,
    topWorkoutScore: 91,
    topWorkoutSummary: "Boxing — 12 rounds sparring. HR peaked 182. Left everything in the ring.",
    user: { name: "Jake M", avatarUrl: undefined },
    rank: 1,
  },
  {
    _id: uid("ws_2"),
    userId: uid("demo_rees"),
    totalScore: 274,
    workoutCount: 4,
    topWorkoutScore: 84,
    topWorkoutSummary: "Upper push — bench PB at 105kg. 52min session, high effort throughout.",
    user: { name: "Rees", avatarUrl: undefined },
    rank: 2,
  },
  {
    _id: uid("ws_3"),
    userId: uid("demo_tom"),
    totalScore: 203,
    workoutCount: 3,
    topWorkoutScore: 78,
    topWorkoutSummary: "5km tempo — 4:32/km pace. Negative split. Strong finish.",
    user: { name: "Tom K", avatarUrl: undefined },
    rank: 3,
  },
  {
    _id: uid("ws_4"),
    userId: uid("demo_dave"),
    totalScore: 148,
    workoutCount: 2,
    topWorkoutScore: 76,
    topWorkoutSummary: "Spin class — 45min at 85rpm avg. Solid session.",
    user: { name: "Dave R", avatarUrl: undefined },
    rank: 4,
  },
];

export const DEMO_PREV_SCORES = [
  { userId: uid("demo_jake"), totalScore: 295 },
  { userId: uid("demo_rees"), totalScore: 281 },
  { userId: uid("demo_tom"), totalScore: 188 },
  { userId: uid("demo_dave"), totalScore: 162 },
];

/* ── Game Plan ── */
export const DEMO_GAMEPLAN = {
  recommendation:
    "You're 38 points off Jake — two strong sessions could close that gap. Your bench PB suggests you're peaking right now. Hit a boxing session mid-week for a 75+ score, then a heavy leg day Saturday for another 65-70. That puts you in range to overtake him if he slacks.",
  predictedScoreNeeded: 320,
};

/* ── Feed ── */
export const DEMO_FEED = [
  {
    _id: uid("fw_1"),
    userId: uid("demo_jake"),
    activityType: "Boxing/MMA",
    durationMinutes: 55,
    effortScore: 91,
    aiReasoning:
      "Twelve rounds of sparring at a 182bpm peak is elite conditioning. The 55-minute duration at this intensity places you firmly in the top tier. Extra credit for the late-evening grind.",
    aiSummary: "55min boxing sparring — 12 rounds — peak HR 182",
    createdAt: h(1),
    scored: true,
    user: { name: "Jake M", avatarUrl: undefined },
    reactions: [
      { _id: uid("r1"), userId: uid("demo_rees"), emoji: "fire" as const },
      { _id: uid("r2"), userId: uid("demo_tom"), emoji: "fire" as const },
      { _id: uid("r3"), userId: uid("demo_dave"), emoji: "respect" as const },
    ],
  },
  {
    _id: uid("fw_2"),
    userId: uid("demo_rees"),
    activityType: "Gym (Strength)",
    durationMinutes: 52,
    effortScore: 84,
    aiReasoning:
      "A bench PB at 105kg is serious progress — that alone deserves recognition. Compound movements with progressive overload across 52 minutes shows disciplined session structure.",
    aiSummary: "52min upper push — bench PB 105kg — 4 compounds",
    createdAt: h(4),
    scored: true,
    user: { name: "Rees", avatarUrl: undefined },
    reactions: [
      { _id: uid("r4"), userId: uid("demo_jake"), emoji: "respect" as const },
      { _id: uid("r5"), userId: uid("demo_tom"), emoji: "fire" as const },
    ],
  },
  {
    _id: uid("fw_3"),
    userId: uid("demo_tom"),
    activityType: "Running",
    durationMinutes: 28,
    effortScore: 78,
    aiReasoning:
      "Sub-4:35 pace on a 5km with a negative split is textbook execution. The data suggests you held back early and finished strong — smart racing.",
    aiSummary: "28min tempo 5km — 4:32/km — negative split",
    createdAt: h(8),
    scored: true,
    user: { name: "Tom K", avatarUrl: undefined },
    reactions: [
      { _id: uid("r6"), userId: uid("demo_rees"), emoji: "fire" as const },
    ],
  },
  {
    _id: uid("fw_4"),
    userId: uid("demo_dave"),
    activityType: "Cycling",
    durationMinutes: 45,
    effortScore: 76,
    aiReasoning:
      "45 minutes on the spin bike at a consistent 85rpm average is solid cardio work. Not flashy, but exactly the kind of session that builds an aerobic base.",
    aiSummary: "45min spin — 85rpm avg — zone 3 steady state",
    createdAt: h(22),
    scored: true,
    user: { name: "Dave R", avatarUrl: undefined },
    reactions: [],
  },
  {
    _id: uid("fw_5"),
    userId: uid("demo_rees"),
    activityType: "Running",
    durationMinutes: 35,
    effortScore: 72,
    aiReasoning:
      "A recovery 5km at 5:15 pace after yesterday's heavy upper session is smart programming. Heart rate stayed in zone 2 which is exactly where you want it for active recovery.",
    aiSummary: "35min easy 5km — 5:15/km — active recovery",
    createdAt: h(26),
    scored: true,
    user: { name: "Rees", avatarUrl: undefined },
    reactions: [
      { _id: uid("r7"), userId: uid("demo_tom"), emoji: "respect" as const },
    ],
  },
];

/* ── Profile workouts (84 days of activity) ── */
function generateProfileWorkouts() {
  const types = ["Gym (Strength)", "Running", "Boxing/MMA", "Gym (Cardio)", "Walking", "HIIT/CrossFit"];
  const workouts: any[] = [];
  const rng = (min: number, max: number) => Math.round(min + Math.random() * (max - min));
  // seed-ish: use deterministic data
  const data = [
    { day: 1, type: "Gym (Strength)", dur: 52, score: 84 },
    { day: 1, type: "Running", dur: 35, score: 72 },
    { day: 3, type: "Boxing/MMA", dur: 60, score: 81 },
    { day: 5, type: "Gym (Strength)", dur: 48, score: 77 },
    { day: 7, type: "Running", dur: 42, score: 68 },
    { day: 8, type: "HIIT/CrossFit", dur: 30, score: 82 },
    { day: 10, type: "Gym (Strength)", dur: 55, score: 79 },
    { day: 12, type: "Running", dur: 30, score: 74 },
    { day: 13, type: "Boxing/MMA", dur: 45, score: 76 },
    { day: 15, type: "Gym (Strength)", dur: 50, score: 80 },
    { day: 17, type: "Walking", dur: 60, score: 32 },
    { day: 18, type: "Running", dur: 50, score: 71 },
    { day: 20, type: "Gym (Strength)", dur: 55, score: 83 },
    { day: 22, type: "Boxing/MMA", dur: 55, score: 85 },
    { day: 24, type: "Gym (Cardio)", dur: 40, score: 66 },
    { day: 26, type: "Gym (Strength)", dur: 48, score: 78 },
    { day: 28, type: "Running", dur: 25, score: 76 },
    { day: 30, type: "HIIT/CrossFit", dur: 35, score: 80 },
    { day: 32, type: "Gym (Strength)", dur: 52, score: 75 },
    { day: 35, type: "Running", dur: 40, score: 70 },
    { day: 37, type: "Boxing/MMA", dur: 50, score: 88 },
    { day: 40, type: "Gym (Strength)", dur: 45, score: 74 },
    { day: 42, type: "Running", dur: 55, score: 69 },
    { day: 45, type: "Gym (Strength)", dur: 50, score: 82 },
    { day: 48, type: "Boxing/MMA", dur: 60, score: 86 },
    { day: 50, type: "Gym (Cardio)", dur: 35, score: 63 },
    { day: 53, type: "Running", dur: 30, score: 73 },
    { day: 55, type: "Gym (Strength)", dur: 55, score: 79 },
    { day: 58, type: "Walking", dur: 45, score: 28 },
    { day: 60, type: "HIIT/CrossFit", dur: 28, score: 77 },
    { day: 63, type: "Gym (Strength)", dur: 50, score: 81 },
    { day: 65, type: "Running", dur: 45, score: 72 },
    { day: 68, type: "Boxing/MMA", dur: 55, score: 83 },
    { day: 70, type: "Gym (Strength)", dur: 48, score: 76 },
    { day: 73, type: "Running", dur: 35, score: 67 },
    { day: 75, type: "Gym (Strength)", dur: 52, score: 80 },
    { day: 78, type: "Boxing/MMA", dur: 50, score: 79 },
    { day: 80, type: "Gym (Cardio)", dur: 40, score: 64 },
    { day: 82, type: "Running", dur: 28, score: 75 },
    { day: 84, type: "Gym (Strength)", dur: 50, score: 78 },
  ];

  return data.map((w, i) => ({
    _id: uid(`pw_${i}`),
    userId: uid("demo_rees"),
    activityType: w.type,
    durationMinutes: w.dur,
    effortScore: w.score,
    scored: true,
    startedAt: d(w.day),
    weekId: getWeekIdFromDate(new Date(d(w.day))),
    createdAt: d(w.day),
  }));
}

function getWeekIdFromDate(date: Date): string {
  const dt = new Date(date);
  dt.setUTCHours(0, 0, 0, 0);
  dt.setUTCDate(dt.getUTCDate() + 4 - (dt.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((dt.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${dt.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export const DEMO_WORKOUTS = generateProfileWorkouts();
