# Battleboard — Setup Guide

## Prerequisites
- Node.js 18+
- Accounts needed: Convex, Clerk, Stripe, OpenAI, Strava (developer)

---

## 1. Convex (Database + Backend)

```bash
npx convex dev
```
- Log in at the prompt → creates a new Convex project
- Copy the `NEXT_PUBLIC_CONVEX_URL` from the output into `.env.local`
- This generates `convex/_generated/` (replaces the stubs)

---

## 2. Clerk (Auth)

1. Create a project at [clerk.com](https://clerk.com)
2. Enable Google OAuth + Email auth
3. Copy keys into `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
4. In Clerk dashboard → JWT Templates → Add `convex` template (for Convex auth)

---

## 3. OpenAI

1. Get an API key at [platform.openai.com](https://platform.openai.com)
2. Add to `.env.local`:
   ```
   OPENAI_API_KEY=sk-...
   ```

---

## 4. Strava (Developer App)

1. Create an app at [strava.com/settings/api](https://www.strava.com/settings/api)
2. Set "Authorization Callback Domain" to `localhost` (dev) / your domain (prod)
3. Copy Client ID + Secret into `.env.local`:
   ```
   NEXT_PUBLIC_STRAVA_CLIENT_ID=12345
   STRAVA_CLIENT_ID=12345
   STRAVA_CLIENT_SECRET=abc...
   ```

---

## 5. Stripe (Payments)

1. Create products at [dashboard.stripe.com](https://dashboard.stripe.com)
   - Monthly: £3.99/month → copy Price ID
   - Yearly: £29.99/year → copy Price ID
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_ID_MONTHLY=price_...
   STRIPE_PRICE_ID_YEARLY=price_...
   ```
3. For local webhook testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

---

## 6. Run Locally

```bash
# Terminal 1: Convex dev server
npx convex dev

# Terminal 2: Next.js dev server
npm run dev
```

Visit [localhost:3000](http://localhost:3000)

---

## 7. Deploy to Vercel

```bash
# Push to GitHub, then:
vercel deploy

# Set all env vars in Vercel dashboard
# Update NEXT_PUBLIC_APP_URL to your Vercel URL
```

After deploy, update Strava callback URL to: `https://your-app.vercel.app/api/strava/callback`

---

## App Flow

1. User visits `/` → sees landing page → signs up (Clerk)
2. Clerk redirects to `/onboarding` → connect Strava + create/join group
3. Dashboard at `/dashboard` → leaderboard, feed, profile
4. Log workout via `+` FAB → AI scores in ~2s → score reveal animation
5. Strava workouts sync automatically via webhook

---

## Key Files

| File | Purpose |
|------|---------|
| `convex/schema.ts` | Database schema |
| `convex/ai.ts` | AI scoring + narrative + gameplan |
| `convex/workouts.ts` | Workout CRUD + Strava sync |
| `convex/weeklyScores.ts` | Leaderboard aggregation |
| `src/components/workout/LogWorkoutSheet.tsx` | Manual workout entry |
| `src/components/workout/ScoreReveal.tsx` | Score reveal animation |
| `src/components/leaderboard/LeaderboardView.tsx` | Weekly leaderboard |
| `src/components/feed/WorkoutCard.tsx` | Feed workout cards + reactions |
