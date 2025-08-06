// app/api/bluesky/oauth/authorize/route.ts
import { NextRequest, NextResponse } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { getAuthorizationUrl } from "@/services/post/bluesky/oauth-client-node";
import { SupabaseSessionStore } from "@/services/post/bluesky/store-session";
import { SupabaseStateStore } from "@/services/post/bluesky/store-state";

export async function POST(request: NextRequest) {
  try {
    const serverAuth = await initServerAuth();
    const stateStore = new SupabaseStateStore({ ...serverAuth });
    const sessionStore = new SupabaseSessionStore({ ...serverAuth });

    const { username } = await request.json();

    console.log("Generating authorization URL for user:", username);

    const authUrl = await getAuthorizationUrl(
      username,
      sessionStore,
      stateStore,
    );

    return NextResponse.json({
      authUrl,
      success: true,
    });
  } catch (error: unknown) {
    console.error("Authorization URL generation error:", error);
    const errMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: `Failed to generate authorization URL: ${errMessage}`,
        success: false,
      },
      { status: 500 },
    );
  }
}
