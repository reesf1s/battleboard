"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

function isValidClerkKey(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  return (
    (key.startsWith("pk_live_") || key.startsWith("pk_test_")) &&
    !key.includes("placeholder") &&
    !key.includes("your_key") &&
    key.length > 30
  );
}

function isValidConvexUrl(): boolean {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";
  return (
    url.includes(".convex.cloud") &&
    !url.includes("placeholder") &&
    !url.includes("your-project")
  );
}

let convex: ConvexReactClient | null = null;
if (isValidConvexUrl()) {
  convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}

function ConvexWithClerk({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex!} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  if (!isValidClerkKey() || !convex) {
    // Demo mode — no providers, components detect and use static data
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={{
        variables: {
          colorPrimary: "#4ADE80",
          colorBackground: "#0D0F14",
          colorText: "#ECEEF3",
          colorTextSecondary: "#8A91A8",
          colorInputBackground: "#191D29",
          colorInputText: "#ECEEF3",
          borderRadius: "10px",
        },
      }}
    >
      <ConvexWithClerk>{children}</ConvexWithClerk>
    </ClerkProvider>
  );
}
