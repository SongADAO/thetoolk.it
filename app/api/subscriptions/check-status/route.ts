import { NextResponse } from "next/server";

import { getSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";

export async function GET() {
  const serverAuth = await initServerAuth();

  const subscription = await getSubscription({ ...serverAuth });

  return NextResponse.json(subscription);
}
