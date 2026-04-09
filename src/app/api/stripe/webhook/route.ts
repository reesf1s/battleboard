import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes("placeholder") || key.includes("your_key")) return null;
  return new Stripe(key);
}

function getConvex(): ConvexHttpClient | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url || url.includes("placeholder") || url.includes("your-project")) return null;
  return new ConvexHttpClient(url);
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const convex = getConvex();

  if (!stripe || !convex) {
    console.error("Stripe webhook: missing STRIPE_SECRET_KEY or NEXT_PUBLIC_CONVEX_URL");
    return NextResponse.json({ error: "Service not configured" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Stripe webhook: missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const subscription = event.data.object as Stripe.Subscription;
  const clerkUserId = subscription.metadata?.clerkUserId;

  if (!clerkUserId) {
    console.warn("Stripe webhook: subscription missing clerkUserId metadata", { eventId: event.id });
    return NextResponse.json({ received: true });
  }

  const convexUser = await convex.query(api.users.getByClerkId, { clerkId: clerkUserId });
  if (!convexUser) {
    console.warn("Stripe webhook: no Convex user found for clerkId", clerkUserId);
    return NextResponse.json({ received: true });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const status =
        subscription.status === "active" || subscription.status === "trialing"
          ? "active"
          : "expired";
      const priceId = subscription.items.data[0]?.price.id;
      const tier: "pro" | "compete" =
        priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO ? "pro" : "compete";
      await convex.mutation(api.users.updateSubscription, {
        userId: convexUser._id,
        status,
        expiresAt: (subscription as any).current_period_end * 1000,
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        tier,
      });
      break;
    }
    case "customer.subscription.deleted": {
      await convex.mutation(api.users.updateSubscription, {
        userId: convexUser._id,
        status: "expired",
        stripeCustomerId: subscription.customer as string,
        tier: undefined,
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
