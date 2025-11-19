import { NextRequest, NextResponse } from "next/server";

import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { publishPost } from "@/services/post/twitter/post";

export async function POST(request: NextRequest) {
  try {
    const serverAuth = await initServerAuth();
    await gateHasActiveSubscription({ ...serverAuth });

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId: "twitter",
    });

    const postId = await publishPost({
      ...(await request.json()),
      accessToken: authorization.authorization.accessToken,
      mode: "server",
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
