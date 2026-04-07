"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { convex } from "@/lib/convex";

function ConvexWithClerk({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
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
