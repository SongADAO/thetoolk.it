import { NextRequest, NextResponse } from "next/server";

import { logServerPost } from "@/lib/logs";
import { getBaseUrlFromRequest } from "@/lib/request";
import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { uploadVideo } from "@/services/post/tiktok/post";

export async function POST(request: NextRequest) {
  const serviceId = "tiktok";

  try {
    const serverAuth = await initServerAuth();
    await gateHasActiveSubscription({ ...serverAuth });

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId,
    });

    const { options, privacy, text, title, videoUrl } = await request.json();

    // Modify the TikTok video URL to use a verified proxy domain.
    const videoUrlObject = new URL(videoUrl);
    const proxyVideoUrlObject = new URL(
      `/api/storage${videoUrlObject.pathname}${videoUrlObject.search}`,
      getBaseUrlFromRequest(request),
    );
    const proxyVideoUrl = proxyVideoUrlObject.toString();

    const publishId = await uploadVideo({
      accessToken: authorization.authorization.accessToken,
      mode: "server",
      options,
      privacy,
      text,
      title,
      videoUrl: proxyVideoUrl,
    });

    await logServerPost({
      ...serverAuth,
      postData: {
        options,
        privacy,
        proxyVideoUrl,
        publishId,
        text,
        title,
        videoUrl,
      },
      serviceId,
      statusId: 2,
    });

    return NextResponse.json({ data: { publish_id: publishId } });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { error: { message: errMessage } },
      { status: 500 },
    );
  }
}
