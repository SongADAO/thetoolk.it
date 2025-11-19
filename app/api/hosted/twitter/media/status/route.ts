import { NextRequest } from "next/server";

import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { statusUploadVideo } from "@/services/post/twitter/post";

export async function POST(request: NextRequest) {
  try {
    const serverAuth = await initServerAuth();
    await gateHasActiveSubscription({ ...serverAuth });

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId: "twitter",
    });

    const statusData = await statusUploadVideo({
      ...(await request.json()),
      accessToken: authorization.authorization.accessToken,
      mode: "server",
    });

    return Response.json(statusData);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: { message: errMessage } }, { status: 500 });
  }
}
