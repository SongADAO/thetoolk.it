import { NextRequest, NextResponse } from "next/server";

import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { checkPublishStatus } from "@/services/post/tiktok/post";

export async function POST(request: NextRequest) {
  const serviceId = "tiktok";

  try {
    const serverAuth = await initServerAuth();
    await gateHasActiveSubscription({ ...serverAuth });

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId,
    });

    const { publish_id: publishId } = await request.json();

    if (!publishId) {
      return NextResponse.json(
        { error: { message: "publish_id is required" } },
        { status: 400 },
      );
    }

    const result = await checkPublishStatus({
      accessToken: authorization.authorization.accessToken,
      mode: "server",
      publishId,
    });

    return NextResponse.json({
      data: {
        fail_reason: result.fail_reason,
        status: result.status,
      },
    });
  } catch (err: unknown) {
    const errMessage =
      err instanceof Error ? err.message : "Status check failed";
    return NextResponse.json(
      { error: { message: errMessage } },
      { status: 500 },
    );
  }
}
