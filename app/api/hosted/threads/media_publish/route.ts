import { NextRequest } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { getServiceAuthorization } from "@/lib/supabase/service";
import { publishMedia } from "@/services/post/threads/post";

export async function POST(request: NextRequest) {
  try {
    const authorization = await getServiceAuthorization({
      ...(await initServerAuth()),
      serviceId: "threads",
    });

    const postId = await publishMedia({
      ...(await request.json()),
      accessToken: authorization.accessToken,
    });

    return Response.json({ id: postId });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: { message: errMessage } }, { status: 500 });
  }
}
