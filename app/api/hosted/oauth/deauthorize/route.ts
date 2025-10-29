import { NextRequest } from "next/server";

// import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import {
  updateServiceAccounts,
  updateServiceAuthorization,
} from "@/lib/supabase/service";
import { defaultOauthExpiration } from "@/services/post/types";

export async function POST(request: NextRequest) {
  try {
    const { serviceId } = await request.json();

    const serverAuth = await initServerAuth();
    // await gateHasActiveSubscription({ ...serverAuth });

    await updateServiceAuthorization({
      ...serverAuth,
      serviceAuthorization: null,
      serviceExpiration: defaultOauthExpiration,
      serviceId,
    });

    await updateServiceAccounts({
      ...serverAuth,
      serviceAccounts: [],
      serviceId,
    });

    return Response.json({ success: true });
  } catch (err: unknown) {
    console.error(err);
    const errMessage = err instanceof Error ? err.message : "Auth failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
