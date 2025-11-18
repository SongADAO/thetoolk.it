import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { getBaseUrlFromRequest } from "@/lib/request";
import { getPriceId } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";

export async function POST(request: NextRequest) {
  try {
    const serverAuth = await initServerAuth();

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

    const { type } = await request.json();

    const baseUrl = getBaseUrlFromRequest(request);

    const session = await stripe.checkout.sessions.create({
      cancel_url: `${baseUrl}/subscribe/cancel`,
      client_reference_id: serverAuth.user.id,
      line_items: [{ price: getPriceId(type), quantity: 1 }],
      mode: "subscription",
      success_url: `${baseUrl}/subscribe/success`,
    });

    if (!session.url) {
      throw new Error("No URL returned from Stripe");
    }

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Checkout failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
