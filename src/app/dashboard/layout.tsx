import { AppShell } from "@/components/layout/AppShell";
import { headers } from "next/headers";

const isClerkConfigured = () => {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  return (
    (key.startsWith("pk_live_") || key.startsWith("pk_test_")) &&
    !key.includes("placeholder") &&
    !key.includes("your_key") &&
    key.length > 30
  );
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isClerkConfigured()) {
    // Check if Clerk middleware actually ran (it sets this header)
    const h = await headers();
    const clerkStatus = h.get("x-clerk-auth-status");
    if (clerkStatus) {
      try {
        const { auth } = await import("@clerk/nextjs/server");
        const { redirect } = await import("next/navigation");
        const { userId } = await auth();
        if (!userId) redirect("/sign-in");
      } catch {
        // If auth() fails, skip — demo mode or middleware bypass
      }
    }
  }

  return <AppShell>{children}</AppShell>;
}
