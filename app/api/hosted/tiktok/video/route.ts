import { NextRequest } from "next/server";

import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { getBaseUrlFromRequest } from "@/services/post/hosted";
import { uploadVideo } from "@/services/post/tiktok/post";

export async function POST(request: NextRequest) {
  try {
    const serverAuth = await initServerAuth();
    await gateHasActiveSubscription({ ...serverAuth });

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId: "tiktok",
    });

    const data = await request.json();

    // Modify the TikTok video URL to use a verified proxy domain.
    const videoUrl = new URL(data.videoUrl);
    data.videoUrl = new URL(
      `/api/storage${videoUrl.pathname}${videoUrl.search}`,
      getBaseUrlFromRequest(request),
    );

    const publishId = await uploadVideo({
      ...data,
      accessToken: authorization.authorization.accessToken,
      mode: "hosted",
    });

    return Response.json({ data: { publish_id: publishId } });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: { message: errMessage } }, { status: 500 });
  }
}
