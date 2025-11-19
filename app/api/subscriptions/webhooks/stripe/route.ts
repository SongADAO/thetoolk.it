import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature") ?? "";

    const supabaseAdmin = createAdminClient();

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? "",
    );

    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        // Get the subscription details
        const subscription = await stripe.subscriptions.retrieve(
          String(session.subscription),
        );

        await supabaseAdmin.from("subscriptions").insert({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          current_period_end: new Date(subscription.current_period_end * 1000),
          price_id: subscription.items.data[0].price.id,
          status: subscription.status,
          stripe_customer_id: String(session.customer),
          stripe_subscription_id: subscription.id,
          user_id: session.client_reference_id,
        });
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;

        await supabaseAdmin
          .from("subscriptions")
          .update({
            current_period_end: new Date(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              subscription.current_period_end * 1000,
            ),
            price_id: subscription.items.data[0].price.id,
            status: subscription.status,
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }
      default:
        throw new Error(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Webhook failed";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
