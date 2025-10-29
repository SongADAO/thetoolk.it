import { NextRequest } from "next/server";

import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import { updateServiceAuthorizationAndAccounts } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  const serviceId = "neynar";
  try {
    const serverAuth = await initServerAuth();
    await gateHasActiveSubscription({ ...serverAuth });

    const { authorization, expiration, accounts } = await request.json();
    console.log(authorization, expiration, accounts);

    await updateServiceAuthorizationAndAccounts({
      ...serverAuth,
      serviceAccounts: accounts,
      serviceAuthorization: authorization,
      serviceExpiration: expiration,
      serviceId,
    });

    return Response.json({ success: true });
  } catch (err: unknown) {
    console.error(err);
    const errMessage = err instanceof Error ? err.message : "Auth failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
