import { NextRequest, NextResponse } from "next/server";

import { getBaseUrlFromRequest } from "@/lib/request";
// import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import {
  getServiceAuthorizationAndExpiration,
  updateServiceAuthorization,
} from "@/lib/supabase/service";
import { getOAuthClient } from "@/services/post/bluesky/oauth-client-node";
import { SupabaseSessionStore } from "@/services/post/bluesky/store-session";
import { SupabaseStateStore } from "@/services/post/bluesky/store-state";

export async function POST(request: NextRequest) {
  const serviceId = "bluesky";

  try {
    const serverAuth = await initServerAuth();
    // await gateHasActiveSubscription();

    const stateStore = new SupabaseStateStore({ ...serverAuth });
    const sessionStore = new SupabaseSessionStore({ ...serverAuth });

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId,
    });

    const client = await getOAuthClient(
      sessionStore,
      stateStore,
      getBaseUrlFromRequest(request),
    );

    await client.restore(authorization.authorization.tokenSet.sub);

    // Refresh token is renewed whenever used.
    const now = new Date();
    const refreshTokenExpiresAt = new Date(
      now.getTime() + 7 * 24 * 60 * 60 * 1000,
    );
    authorization.expiration.refreshTokenExpiresAt =
      refreshTokenExpiresAt.toISOString();
    await updateServiceAuthorization({
      ...serverAuth,
      serviceAuthorization: authorization.authorization,
      serviceExpiration: authorization.expiration,
      serviceId,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Auth failed";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
