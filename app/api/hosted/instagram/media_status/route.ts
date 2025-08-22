import { NextRequest } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { getServiceAuthorization } from "@/lib/supabase/service";
import { checkMediaStatus } from "@/services/post/instagram/post";

export async function POST(request: NextRequest) {
  try {
    const authorization = await getServiceAuthorization({
      ...(await initServerAuth()),
      serviceId: "instagram",
    });

    const statusCode = await checkMediaStatus({
      ...(await request.json()),
      accessToken: authorization.authorization.accessToken,
    });

    return Response.json({ status_code: statusCode });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: { message: errMessage } }, { status: 500 });
  }
}
