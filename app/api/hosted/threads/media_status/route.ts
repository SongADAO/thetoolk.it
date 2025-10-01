import { NextRequest } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { checkMediaStatus } from "@/services/post/threads/post";

export async function POST(request: NextRequest) {
  try {
    const authorization = await getServiceAuthorizationAndExpiration({
      ...(await initServerAuth()),
      serviceId: "threads",
    });

    const status = await checkMediaStatus({
      ...(await request.json()),
      accessToken: authorization.authorization.accessToken,
    });

    return Response.json({ status });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: { message: errMessage } }, { status: 500 });
  }
}
