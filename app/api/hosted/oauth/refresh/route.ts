import { NextRequest, NextResponse } from "next/server";

// import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import {
  getServiceAuthorizationAndExpiration,
  updateServiceAuthorization,
} from "@/lib/supabase/service";
import { refreshAccessToken } from "@/services/post/hosted";

export async function POST(request: NextRequest) {
  try {
    const { serviceId } = await request.json();

    const serverAuth = await initServerAuth();
    // await gateHasActiveSubscription({ ...serverAuth });

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId,
    });

    const newAuthorization = await refreshAccessToken(
      serviceId,
      authorization.authorization,
      authorization.expiration,
    );

    await updateServiceAuthorization({
      ...serverAuth,
      serviceAuthorization: newAuthorization.authorization,
      serviceExpiration: newAuthorization.expiration,
      serviceId,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Auth failed";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
