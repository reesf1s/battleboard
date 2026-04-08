import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

function getConvex(): ConvexHttpClient | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url || url.includes("placeholder") || url.includes("your-project")) return null;
  return new ConvexHttpClient(url);
}

export async function GET(req: NextRequest) {
  const convex = getConvex();
  if (!convex) {
    console.error("Strava callback: NEXT_PUBLIC_CONVEX_URL not configured");
    return NextResponse.redirect(new URL("/onboarding?strava=error", req.url));
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const userId = searchParams.get("state") as Id<"users"> | null;
  const error = searchParams.get("error");

  if (error || !code || !userId) {
    return NextResponse.redirect(new URL("/onboarding?strava=error", req.url));
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId.includes("your_") || clientSecret.includes("your_")) {
    console.error("Strava callback: STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET not configured");
    return NextResponse.redirect(new URL("/onboarding?strava=error", req.url));
  }

  try {
    const response = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      console.error("Strava OAuth token exchange failed:", response.status);
      return NextResponse.redirect(new URL("/onboarding?strava=error", req.url));
    }

    const data = await response.json();

    await convex.mutation(api.users.connectStrava, {
      userId,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
      athleteId: data.athlete.id,
    });

    // Trigger background sync
    await convex.action(api.strava.syncActivities, { userId });

    return NextResponse.redirect(new URL("/onboarding?strava=connected", req.url));
  } catch (err) {
    console.error("Strava OAuth error:", err);
    return NextResponse.redirect(new URL("/onboarding?strava=error", req.url));
  }
}
