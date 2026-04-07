import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/onboarding/LandingPage";

const isClerkConfigured = () => {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  return (
    (key.startsWith("pk_live_") || key.startsWith("pk_test_")) &&
    key !== "pk_test_placeholder"
  );
};

export default async function Home() {
  if (isClerkConfigured()) {
    const { userId } = await auth();
    if (userId) redirect("/dashboard");
  }
  return <LandingPage />;
}
