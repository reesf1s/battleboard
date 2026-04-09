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

    const { priceId } = await req.json();
    const stripe = getStripe();

    // Try to get user email from Clerk for Stripe customer lookup
    let customerEmail: string | undefined;
    try {
      const { currentUser } = await import("@clerk/nextjs/server");
      const user = await currentUser();
      customerEmail = user?.emailAddresses?.[0]?.emailAddress;
    } catch {
      // Non-critical — Stripe will ask for email during checkout
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fitness-ivory-omega.vercel.app";

    const tier = priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO ? "pro" : "compete";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: customerEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?subscribed=true`,
      cancel_url: `${appUrl}/subscription`,
      metadata: { clerkUserId: userId, tier },
      subscription_data: {
        trial_period_days: 7,
        metadata: { clerkUserId: userId, tier },
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
