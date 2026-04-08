import { AppShell } from "@/components/layout/AppShell";

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
    const { auth } = await import("@clerk/nextjs/server");
    const { redirect } = await import("next/navigation");
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");
  }

  return <AppShell>{children}</AppShell>;
}
