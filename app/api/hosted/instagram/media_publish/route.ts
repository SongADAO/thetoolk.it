import { NextRequest, NextResponse } from "next/server";

import { logServerPost } from "@/lib/logs";
import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { publishMedia } from "@/services/post/instagram/post";

export async function POST(request: NextRequest) {
  const serviceId = "instagram";

  try {
    const serverAuth = await initServerAuth();
    await gateHasActiveSubscription({ ...serverAuth });

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId,
    });

    const { creationId, userId } = await request.json();

    const postId = await publishMedia({
      accessToken: authorization.authorization.accessToken,
      creationId,
      userId,
    });

    await logServerPost({
      ...serverAuth,
      postData: {
        creationId,
        postId,
      },
      serviceId,
      statusId: 2,
    });

    return NextResponse.json({ id: postId });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { error: { message: errMessage } },
      { status: 500 },
    );
  }
}
