import { NextRequest } from "next/server";

import { initServerAuth } from "@/lib/supabase/server-auth";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { initiateResumableUpload } from "@/services/post/youtube/post";

export async function POST(request: NextRequest) {
  try {
    const serverAuth = await initServerAuth();

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId: "youtube",
    });

    const uploadUrl = await initiateResumableUpload({
      ...(await request.json()),
      accessToken: authorization.authorization.accessToken,
    });

    return new Response(null, {
      headers: {
        Location: uploadUrl,
      },
      status: 201,
    });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: { message: errMessage } }, { status: 500 });
  }
}
