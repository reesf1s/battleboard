import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/strava/callback(.*)",
  "/api/stripe/webhook(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/subscription(.*)",
  "/join(.*)",
  "/onboarding(.*)",
]);

// If Clerk keys aren't configured yet, pass all requests through
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const isClerkConfigured =
  clerkPublishableKey.startsWith("pk_live_") ||
  clerkPublishableKey.startsWith("pk_test_") &&
    clerkPublishableKey !== "pk_test_placeholder";

export default clerkMiddleware(async (auth, req) => {
  if (!isClerkConfigured) {
    return NextResponse.next();
  }
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
