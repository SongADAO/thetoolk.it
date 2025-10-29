import { NextRequest } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { finalizeUploadVideo } from "@/services/post/twitter/post";

export async function POST(request: NextRequest) {
  try {
    const serverAuth = await initServerAuth();

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId: "twitter",
    });

    const finalizeData = await finalizeUploadVideo({
      ...(await request.json()),
      accessToken: authorization.authorization.accessToken,
      mode: "hosted",
    });

    return Response.json(finalizeData);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: { message: errMessage } }, { status: 500 });
  }
}
