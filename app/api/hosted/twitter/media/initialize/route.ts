import { NextRequest } from "next/server";

import { initServerAuth } from "@/lib/supabase/server-auth";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { initializeUploadVideo } from "@/services/post/twitter/post";

export async function POST(request: NextRequest) {
  try {
    const serverAuth = await initServerAuth();

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId: "twitter",
    });

    const mediaId = await initializeUploadVideo({
      ...(await request.json()),
      accessToken: authorization.authorization.accessToken,
      mode: "hosted",
    });

    return Response.json({ data: { id: mediaId } });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: { message: errMessage } }, { status: 500 });
  }
}
