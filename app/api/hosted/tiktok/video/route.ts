import { NextRequest } from "next/server";

import { initServerAuth } from "@/lib/supabase/server-auth";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { uploadVideo } from "@/services/post/tiktok/post";

export async function POST(request: NextRequest) {
  try {
    const serverAuth = await initServerAuth();

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId: "tiktok",
    });

    const publishId = await uploadVideo({
      ...(await request.json()),
      accessToken: authorization.authorization.accessToken,
      mode: "hosted",
    });

    return Response.json({ data: { publish_id: publishId } });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: { message: errMessage } }, { status: 500 });
  }
}
