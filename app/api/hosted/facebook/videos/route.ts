import { NextRequest } from "next/server";

import { initServerAuth } from "@/lib/supabase/server-auth";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { uploadVideo } from "@/services/post/facebook/post";

export async function POST(request: NextRequest) {
  try {
    const serverAuth = await initServerAuth();

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId: "facebook",
    });

    const postId = await uploadVideo({
      ...(await request.json()),
      accessToken: authorization.authorization.accessToken,
    });

    return Response.json({ id: postId });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: { message: errMessage } }, { status: 500 });
  }
}
