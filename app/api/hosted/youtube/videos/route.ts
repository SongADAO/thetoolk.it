import { NextRequest } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { getServiceAuthorization } from "@/lib/supabase/service";
import { initiateResumableUpload } from "@/services/post/youtube/post";

export async function POST(request: NextRequest) {
  try {
    const authorization = await getServiceAuthorization({
      ...(await initServerAuth()),
      serviceId: "youtube",
    });

    const uploadUrl = await initiateResumableUpload({
      ...(await request.json()),
      accessToken: authorization.accessToken,
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
