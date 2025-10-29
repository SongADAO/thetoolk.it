import { NextRequest, NextResponse } from "next/server";

import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import { getAuthorizationUrl } from "@/services/post/bluesky/oauth-client-node";
import { SupabaseSessionStore } from "@/services/post/bluesky/store-session";
import { SupabaseStateStore } from "@/services/post/bluesky/store-state";
import { getBaseUrlFromRequest } from "@/services/post/hosted";

export async function POST(request: NextRequest) {
  try {
    const serverAuth = await initServerAuth();
    await gateHasActiveSubscription({ ...serverAuth });

    const stateStore = new SupabaseStateStore({ ...serverAuth });
    const sessionStore = new SupabaseSessionStore({ ...serverAuth });

    const { username } = await request.json();

    console.log("Generating authorization URL for user:", username);

    const authUrl = await getAuthorizationUrl(
      username,
      sessionStore,
      stateStore,
      getBaseUrlFromRequest(request),
    );

    return NextResponse.json({
      authUrl,
      success: true,
    });
  } catch (err: unknown) {
    console.error("Authorization URL generation error:", err);
    const errMessage = err instanceof Error ? err.message : "Unknown error";

    return NextResponse.json(
      {
        error: `Failed to generate authorization URL: ${errMessage}`,
        success: false,
      },
      { status: 500 },
    );
  }
}
