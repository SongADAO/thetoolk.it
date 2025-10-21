import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { getBaseUrlFromRequest } from "@/services/post/hosted";

function getPriceId(type: string) {
  switch (type) {
    case "pro-month":
      return process.env.STRIPE_PRO_MONTH_PRICE_ID ?? "";
    case "pro-year":
      return process.env.STRIPE_PRO_YEAR_PRICE_ID ?? "";
    default:
      throw new Error("Invalid subscription type");
  }
}

export async function POST(request: NextRequest) {
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

  return NextResponse.json({ url: session.url });
}
