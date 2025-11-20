import { NextRequest, NextResponse } from "next/server";

import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { appendUploadVideo } from "@/services/post/twitter/post";

export async function POST(request: NextRequest) {
  const serviceId = "twitter";

  try {
    const serverAuth = await initServerAuth();
    await gateHasActiveSubscription({ ...serverAuth });

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId,
    });

    // Parse FormData instead of JSON
    const formData = await request.formData();

    // Extract fields from FormData
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const chunk = formData.get("chunk") as Blob;
    const mediaId = String(formData.get("mediaId"));
    const segmentIndex = parseInt(String(formData.get("segmentIndex")), 10);

    const response = await appendUploadVideo({
      accessToken: authorization.authorization.accessToken,
      chunk,
      mediaId,
      mode: "server",
      segmentIndex,
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { error: { message: errMessage } },
      { status: 500 },
    );
  }
}
