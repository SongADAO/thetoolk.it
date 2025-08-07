import { NextResponse } from "next/server";

import {
  generateCodeChallenge,
  generateCodeVerifier,
} from "@/lib/code-verifier";
import { initServerAuth } from "@/lib/supabase/hosted-api";
import {
  getTwitterAuthorizeUrl,
  HOSTED_CREDENTIALS as HOSTED_CREDENTIALS_TWITTER,
} from "@/services/post/twitter/auth";

export async function POST() {
  try {
    const serverAuth = await initServerAuth();

    // Generate PKCE values
    const codeVerifier = generateCodeVerifier();

    // Store code verifier for later use
    const { error: codeVerifierError } = await serverAuth.supabase
      .from("atproto_oauth_states")
      .upsert(
        {
          // Expires in 10 minutes
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          key: "twitter_code_verifier",
          updated_at: new Date().toISOString(),
          user_id: serverAuth.user.id,
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
