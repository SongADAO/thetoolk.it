import { NextRequest, NextResponse } from "next/server";

import { logServerPost } from "@/lib/logs";
import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { createMediaContainer } from "@/services/post/instagram/post";

export async function POST(request: NextRequest) {
  const serviceId = "instagram";

  try {
    const serverAuth = await initServerAuth();
    await gateHasActiveSubscription({ ...serverAuth });

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId,
    });

    const { text, userId, videoUrl } = await request.json();

    const creationId = await createMediaContainer({
      accessToken: authorization.authorization.accessToken,
      text,
      userId,
      videoUrl,
    });

    await logServerPost({
      ...serverAuth,
      postData: {
        creationId,
        text,
        videoUrl,
      },
      serviceId,
      statusId: 1,
    });

    return NextResponse.json({ id: creationId });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { error: { message: errMessage } },
      { status: 500 },
    );
  }
}
