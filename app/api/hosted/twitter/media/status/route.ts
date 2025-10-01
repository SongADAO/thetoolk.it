import { NextRequest } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { statusUploadVideo } from "@/services/post/twitter/post";

export async function POST(request: NextRequest) {
  try {
    const authorization = await getServiceAuthorizationAndExpiration({
      ...(await initServerAuth()),
      serviceId: "twitter",
    });

    const statusData = await statusUploadVideo({
      ...(await request.json()),
      accessToken: authorization.authorization.accessToken,
      mode: "hosted",
    });

    return Response.json(statusData);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: { message: errMessage } }, { status: 500 });
  }
}
