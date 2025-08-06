import { NextRequest } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import {
  getServiceAuthorization,
  updateServiceAuthorization,
} from "@/lib/supabase/service";
import { refreshAccessToken } from "@/services/post/facebook/auth";

export async function POST(request: NextRequest) {
  try {
    const { serviceId } = await request.json();

    const serverAuth = await initServerAuth();

    const authorization = await getServiceAuthorization({
      ...serverAuth,
      serviceId: "facebook",
    });

    const newAuthorization = await refreshAccessToken(authorization);

    await updateServiceAuthorization({
      ...serverAuth,
      serviceAuthorization: newAuthorization,
      serviceId,
    });

    return Response.json({ success: true });
  } catch (err: unknown) {
    console.error(err);
    const errMessage = err instanceof Error ? err.message : "Auth failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
