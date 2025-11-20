import { NextRequest, NextResponse } from "next/server";

import { logServerPost } from "@/lib/logs";
import { getBaseUrlFromRequest } from "@/lib/request";
import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import {
  getServiceAuthorizationAndExpiration,
  updateServiceAuthorization,
} from "@/lib/supabase/service";
import { createAgent } from "@/services/post/bluesky/oauth-client-node";
import { agentUploadBlob } from "@/services/post/bluesky/post";
import { SupabaseSessionStore } from "@/services/post/bluesky/store-session";
import { SupabaseStateStore } from "@/services/post/bluesky/store-state";

export async function POST(request: NextRequest) {
  const serviceId = "bluesky";

  try {
    const serverAuth = await initServerAuth();
    await gateHasActiveSubscription({ ...serverAuth });

    const stateStore = new SupabaseStateStore({ ...serverAuth });
    const sessionStore = new SupabaseSessionStore({ ...serverAuth });

    // Parse FormData instead of JSON
    const formData = await request.formData();

    // Extract fields from FormData
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const video = formData.get("video") as Blob;
    const videoType = String(formData.get("videoType"));

    const data = {
      video,
      videoType,
    };

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId,
    });

    const agent = await createAgent(
      sessionStore,
      stateStore,
      authorization.authorization.tokenSet.sub,
      getBaseUrlFromRequest(request),
    );

    const result = await agentUploadBlob({
      ...data,
      agent,
    });

    await logServerPost({
      ...serverAuth,
      postData: {
        blobRef: result.data.blob,
        videoUrl: "direct_upload",
      },
      serviceId,
      statusId: 1,
    });

    // Refresh token is renewed whenever used.
    const now = new Date();
    const refreshTokenExpiresAt = new Date(
      now.getTime() + 7 * 24 * 60 * 60 * 1000,
    );
    authorization.expiration.refreshTokenExpiresAt =
      refreshTokenExpiresAt.toISOString();
    await updateServiceAuthorization({
      ...serverAuth,
      serviceAuthorization: authorization.authorization,
      serviceExpiration: authorization.expiration,
      serviceId,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { error: { message: errMessage } },
      { status: 500 },
    );
  }
}
