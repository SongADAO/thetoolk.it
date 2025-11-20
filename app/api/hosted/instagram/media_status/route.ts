import { NextRequest, NextResponse } from "next/server";

import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { checkMediaStatus } from "@/services/post/instagram/post";

export async function POST(request: NextRequest) {
  const serviceId = "instagram";

  try {
    const serverAuth = await initServerAuth();
    await gateHasActiveSubscription({ ...serverAuth });

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId,
    });

    const { creationId } = await request.json();

    const statusCode = await checkMediaStatus({
      accessToken: authorization.authorization.accessToken,
      creationId,
    });

    return NextResponse.json({ status_code: statusCode });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { error: { message: errMessage } },
      { status: 500 },
    );
  }
}
