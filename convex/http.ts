import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// Strava webhook verification
http.route({
  path: "/strava/webhook",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === process.env.STRAVA_WEBHOOK_VERIFY_TOKEN) {
      return new Response(JSON.stringify({ "hub.challenge": challenge }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response("Forbidden", { status: 403 });
  }),
});

// Strava webhook events
http.route({
  path: "/strava/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const event = await req.json();

    // Only handle new activities
    if (event.aspect_type === "create" && event.object_type === "activity") {
      const athleteId = event.owner_id;
      // Find user by strava athlete ID and sync
      await ctx.scheduler.runAfter(0, internal.strava.handleWebhookEvent, {
        athleteId,
        activityId: event.object_id,
      });
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
