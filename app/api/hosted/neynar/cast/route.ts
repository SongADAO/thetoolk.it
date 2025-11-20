import { NextRequest, NextResponse } from "next/server";

import { logServerPost } from "@/lib/logs";
import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { HOSTED_CREDENTIALS } from "@/services/post/neynar/auth";
import { createCast } from "@/services/post/neynar/post";

export async function POST(request: NextRequest) {
  const serviceId = "neynar";

  try {
    const serverAuth = await initServerAuth();
    await gateHasActiveSubscription({ ...serverAuth });

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId: "neynar",
    });

    const { text, videoHSLUrl } = await request.json();

    const castHash = await createCast({
      accessToken: authorization.authorization.accessToken,
      clientSecret: HOSTED_CREDENTIALS.clientSecret,
      text,
      videoHSLUrl,
    });

    await logServerPost({
      ...serverAuth,
      postData: {
        text,
        videoHSLUrl,
      },
      serviceId,
      statusId: 2,
    });

    return NextResponse.json({ cast: { hash: castHash } });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { error: { message: errMessage } },
      { status: 500 },
    );
  }
}
