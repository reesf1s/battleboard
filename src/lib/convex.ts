import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";

// Only create client when URL is valid — prevents connection errors in demo mode
export const convex: ConvexReactClient | null =
  convexUrl.includes(".convex.cloud") &&
  !convexUrl.includes("placeholder") &&
  !convexUrl.includes("your-project")
    ? new ConvexReactClient(convexUrl)
    : null;
