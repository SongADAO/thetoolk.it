import { NextRequest } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { HOSTED_CREDENTIALS } from "@/services/post/neynar/auth";
import { createCast } from "@/services/post/neynar/post";

export async function POST(request: NextRequest) {
  try {
    const authorization = await getServiceAuthorizationAndExpiration({
      ...(await initServerAuth()),
      serviceId: "neynar",
    });

    const castHash = await createCast({
      ...(await request.json()),
      accessToken: authorization.authorization.accessToken,
      clientSecret: HOSTED_CREDENTIALS.clientSecret,
    });

    return Response.json({ cast: { hash: castHash } });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: { message: errMessage } }, { status: 500 });
  }
}
