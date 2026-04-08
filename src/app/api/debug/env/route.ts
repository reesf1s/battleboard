import { NextResponse } from "next/server";

// TEMPORARY diagnostic endpoint — will be removed after setup
export async function GET() {
  return NextResponse.json({
    clerk_pk: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 30) + "...",
    clerk_sk: process.env.CLERK_SECRET_KEY?.substring(0, 30) + "...",
    convex: process.env.NEXT_PUBLIC_CONVEX_URL,
    openai: process.env.OPENAI_API_KEY?.substring(0, 20) + "...",
    stripe_pk: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 30) + "...",
    stripe_sk: process.env.STRIPE_SECRET_KEY?.substring(0, 20) + "...",
    strava_id: process.env.STRAVA_CLIENT_ID,
    app_url: process.env.NEXT_PUBLIC_APP_URL,
  });
}
