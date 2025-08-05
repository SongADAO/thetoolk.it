// app/api/bluesky/oauth/authorize/route.ts
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getAuthorizationUrl } from "@/services/post/bluesky/oauth-client-node";
import { SupabaseSessionStore } from "@/services/post/bluesky/store-session";
import { SupabaseStateStore } from "@/services/post/bluesky/store-state";

async function getUser(supabase: SupabaseClient): Promise<User> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const user = await getUser(supabase);
    const stateStore = new SupabaseStateStore(supabase, user);
    const sessionStore = new SupabaseSessionStore(supabase, user);

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
