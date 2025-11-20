import { NextRequest, NextResponse } from "next/server";

import { logServerPost } from "@/lib/logs";
import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { initializeUploadVideo } from "@/services/post/twitter/post";

export async function POST(request: NextRequest) {
  const serviceId = "twitter";

  try {
    const serverAuth = await initServerAuth();
    await gateHasActiveSubscription({ ...serverAuth });

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId,
    });

    const { videoSize, videoType } = await request.json();

    const mediaId = await initializeUploadVideo({
      accessToken: authorization.authorization.accessToken,
      mode: "server",
      videoSize,
      videoType,
    });

    await logServerPost({
      ...serverAuth,
      postData: {
        mediaId,
        videoSize,
        videoType,
      },
      serviceId,
      statusId: 1,
    });

    return NextResponse.json({ data: { id: mediaId } });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { error: { message: errMessage } },
      { status: 500 },
    );
  }
}
