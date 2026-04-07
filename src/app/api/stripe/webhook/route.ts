import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2024-12-18.acacia",
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud");

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const subscription = event.data.object as Stripe.Subscription;
  const clerkUserId = subscription.metadata?.clerkUserId;

  if (!clerkUserId) return NextResponse.json({ received: true });

  // Look up the convex user
  const convexUser = await convex.query(api.users.getByClerkId, { clerkId: clerkUserId });
  if (!convexUser) return NextResponse.json({ received: true });

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const status =
        subscription.status === "active" || subscription.status === "trialing"
          ? "active"
          : "expired";
      await convex.mutation(api.users.updateSubscription, {
        userId: convexUser._id,
        status,
        expiresAt: (subscription as any).current_period_end * 1000,
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
      });
      break;
    }
    case "customer.subscription.deleted": {
      await convex.mutation(api.users.updateSubscription, {
        userId: convexUser._id,
        status: "expired",
        stripeCustomerId: subscription.customer as string,
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
