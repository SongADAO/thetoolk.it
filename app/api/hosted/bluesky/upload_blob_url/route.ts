import { NextRequest } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import {
  getServiceAuthorization,
  updateServiceAuthorization,
} from "@/lib/supabase/service";
import { createAgent } from "@/services/post/bluesky/oauth-client-node";
import { agentUploadBlob } from "@/services/post/bluesky/post";
import { SupabaseSessionStore } from "@/services/post/bluesky/store-session";
import { SupabaseStateStore } from "@/services/post/bluesky/store-state";

export async function POST(request: NextRequest) {
  try {
    const serviceId = "bluesky";
    const serverAuth = await initServerAuth();
    const stateStore = new SupabaseStateStore({ ...serverAuth });
    const sessionStore = new SupabaseSessionStore({ ...serverAuth });

    const { videoUrl, videoType } = await request.json();

    if (!videoUrl) {
      return Response.json(
        { error: { message: "videoUrl is required" } },
        { status: 400 },
      );
    }

    // Fetch video from the provided URL
    const videoResponse = await fetch(videoUrl);

    if (!videoResponse.ok) {
      return Response.json(
        {
          error: {
            message: `Failed to fetch video from URL: ${videoResponse.status} ${videoResponse.statusText}`,
          },
        },
        { status: 400 },
      );
    }

    // Convert the fetched response to a Blob
    const video = await videoResponse.blob();

    const data = {
      video,
      videoType,
    };

    const authorization = await getServiceAuthorization({
      ...serverAuth,
      serviceId,
    });

    const agent = await createAgent(
      sessionStore,
      stateStore,
      authorization.tokenSet.sub,
    );

    const result = await agentUploadBlob({
      ...data,
      agent,
    });

    // Refresh token is renewed whenever used.
    const now = new Date();
    const refreshTokenExpiresAt = new Date(
      now.getTime() + 7 * 24 * 60 * 60 * 1000,
    );
    authorization.refreshTokenExpiresAt = refreshTokenExpiresAt.toISOString();
    await updateServiceAuthorization({
      ...serverAuth,
      serviceAuthorization: authorization,
      serviceId,
    });

    return Response.json(result);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: { message: errMessage } }, { status: 500 });
  }
}
