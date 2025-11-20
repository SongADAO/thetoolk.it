import { NextRequest, NextResponse } from "next/server";

import { logServerPost } from "@/lib/logs";
import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { publishPost } from "@/services/post/twitter/post";

export async function POST(request: NextRequest) {
  const serviceId = "twitter";

  try {
    const serverAuth = await initServerAuth();
    await gateHasActiveSubscription({ ...serverAuth });

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId,
    });

    const { mediaIds, text } = await request.json();

    const postId = await publishPost({
      accessToken: authorization.authorization.accessToken,
      mediaIds,
      mode: "server",
      text,
    });

    await logServerPost({
      ...serverAuth,
      postData: {
        mediaIds,
        postId,
        text,
      },
      serviceId,
      statusId: 2,
    });

    return NextResponse.json({ data: { id: postId } });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { error: { message: errMessage } },
      { status: 500 },
    );
  }
}
