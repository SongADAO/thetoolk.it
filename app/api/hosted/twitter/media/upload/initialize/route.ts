import { NextRequest } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { getServiceAuthorization } from "@/lib/supabase/service";
import { finalizeUploadVideo } from "@/services/post/twitter/post";

export async function POST(request: NextRequest) {
  try {
    const authorization = await getServiceAuthorization({
      ...(await initServerAuth()),
      serviceId: "twitter",
    });

    const statusData = await finalizeUploadVideo({
      ...(await request.json()),
      accessToken: authorization.accessToken,
      mode: "hosted",
    });

    return Response.json(statusData);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: { message: errMessage } }, { status: 500 });
  }
}
