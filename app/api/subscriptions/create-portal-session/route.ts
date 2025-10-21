import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/admin";
import { initServerAuth } from "@/lib/supabase/hosted-api";
import { getBaseUrlFromRequest } from "@/services/post/hosted";

export async function POST(request: NextRequest) {
  try {
    const serverAuth = await initServerAuth();
    const supabaseAdmin = createAdminClient();

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

    const baseUrl = getBaseUrlFromRequest(request);

    // Get the customer's Stripe customer ID from Supabase
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", serverAuth.user.id)
      .single();

    if (!subscription?.stripe_customer_id) {
      return Response.json({ error: "No subscription found" }, { status: 400 });
    }

    // Create a portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${baseUrl}/subscribe`,
    });

    if (!session.url) {
      throw new Error("No URL returned from Stripe");
    }

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Post failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
