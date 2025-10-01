import { NextRequest } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { createMediaContainer } from "@/services/post/instagram/post";

export async function POST(request: NextRequest) {
  try {
    const authorization = await getServiceAuthorizationAndExpiration({
      ...(await initServerAuth()),
      serviceId: "instagram",
    });

    const mediaId = await createMediaContainer({
      ...(await request.json()),
      accessToken: authorization.authorization.accessToken,
    });

    return Response.json({ id: mediaId });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: { message: errMessage } }, { status: 500 });
  }
}
