import { NextRequest, NextResponse } from "next/server";

import { logServerPost } from "@/lib/logs";
import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { uploadVideo } from "@/services/post/facebook/post";

export async function POST(request: NextRequest) {
  const serviceId = "facebook";

  try {
    const serverAuth = await initServerAuth();
    await gateHasActiveSubscription({ ...serverAuth });

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId,
    });

    const { privacy, text, title, userId, videoUrl } = await request.json();

    const postId = await uploadVideo({
      accessToken: authorization.authorization.accessToken,
      privacy,
      text,
      title,
      userId,
      videoUrl,
    });

    await logServerPost({
      ...serverAuth,
      postData: {
        postId,
        text,
        title,
        videoUrl,
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
