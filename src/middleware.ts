import { NextRequest, NextResponse } from "next/server";

function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  return (
    (key.startsWith("pk_live_") || key.startsWith("pk_test_")) &&
    !key.includes("placeholder") &&
    !key.includes("your_key") &&
    key.length > 30
  );
}

export async function middleware(req: NextRequest) {
  // Allow demo mode to bypass auth (dev only)
  if (process.env.NODE_ENV === "development" && req.nextUrl.searchParams.get("demo") === "true") {
    return NextResponse.next();
  }
  if (isClerkConfigured()) {
    try {
      const { clerkMiddleware } = await import("@clerk/nextjs/server");
      const handler = clerkMiddleware();
      return handler(req, {} as any);
    } catch (e) {
      console.error("[middleware] Clerk middleware failed:", e);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
