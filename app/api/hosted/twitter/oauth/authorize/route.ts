// app/api/bluesky/oauth/authorize/route.ts
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import {
  generateCodeChallenge,
  generateCodeVerifier,
} from "@/lib/code-verifier";
import { createClient } from "@/lib/supabase/server";
import {
  getTwitterAuthorizeUrl,
  HOSTED_CREDENTIALS as HOSTED_CREDENTIALS_TWITTER,
} from "@/services/post/twitter/auth";

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

export async function POST() {
  try {
    const supabase = await createClient();

    const user = await getUser(supabase);

    // Generate PKCE values
    const codeVerifier = generateCodeVerifier();

    // Store code verifier for later use
    const { error: codeVerifierError } = await supabase
      .from("atproto_oauth_states")
      .upsert(
        {
          // Expires in 10 minutes
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          key: "twitter_code_verifier",
          updated_at: new Date().toISOString(),
          user_id: user.id,
          value: { codeVerifier },
        },
        {
          // onConflict: "user_id,key",
        },
      );

    if (codeVerifierError) {
      throw new Error("Failed to store code verifier");
    }

    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/hosted/twitter/oauth/callback`;

    const authUrl = getTwitterAuthorizeUrl(
      HOSTED_CREDENTIALS_TWITTER.clientId,
      redirectUri,
      codeChallenge,
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
