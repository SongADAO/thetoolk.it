import { NextRequest, NextResponse } from "next/server";

import { logServerPost } from "@/lib/logs";
import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { initiateResumableUpload } from "@/services/post/youtube/post";

export async function POST(request: NextRequest) {
  const serviceId = "youtube";

  try {
    const serverAuth = await initServerAuth();
    await gateHasActiveSubscription({ ...serverAuth });

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId,
    });

    const { metadata, videoSize, videoType } = await request.json();

    const uploadUrl = await initiateResumableUpload({
      accessToken: authorization.authorization.accessToken,
      metadata,
      videoSize,
      videoType,
    });

    await logServerPost({
      ...serverAuth,
      postData: {
        metadata,
        uploadUrl,
        videoSize,
        videoType,
      },
      serviceId,
      statusId: 1,
    });

    return new NextResponse(null, {
      headers: {
        Location: uploadUrl,
      },
      status: 201,
    });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { error: { message: errMessage } },
      { status: 500 },
    );
  }
}
