import { NextRequest, NextResponse } from "next/server";

/**
 * Minimal middleware — just passes all requests through.
 * Route protection is handled at the layout level via Clerk's auth().
 * Once real Clerk keys are set, you can re-enable clerkMiddleware here.
 */
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
