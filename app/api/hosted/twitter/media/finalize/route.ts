import { NextRequest, NextResponse } from "next/server";

import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { finalizeUploadVideo } from "@/services/post/twitter/post";

export async function POST(request: NextRequest) {
  const serviceId = "twitter";

  try {
    const serverAuth = await initServerAuth();
    await gateHasActiveSubscription({ ...serverAuth });

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId,
    });

    const { mediaId } = await request.json();

    const finalizeData = await finalizeUploadVideo({
      accessToken: authorization.authorization.accessToken,
      mediaId,
      mode: "server",
    });

    return NextResponse.json(finalizeData);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { error: { message: errMessage } },
      { status: 500 },
    );
  }
}
