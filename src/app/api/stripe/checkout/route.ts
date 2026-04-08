import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes("placeholder") || key.includes("your_key")) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  // Auth check — dynamic import so it doesn't fail if Clerk isn't configured
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId, email } = await req.json();
    const stripe = getStripe();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://battleboard-rho.vercel.app";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?subscribed=true`,
      cancel_url: `${appUrl}/subscription`,
      metadata: { clerkUserId: userId },
      subscription_data: {
        trial_period_days: 7,
        metadata: { clerkUserId: userId },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err.message || "Checkout failed" },
      { status: err.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
