// app/api/bluesky/oauth/authorize/route.ts
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import {
  generateCodeChallenge,
  generateCodeVerifier,
} from "@/lib/code-verifier";
import { createClient } from "@/lib/supabase/server";
import {
  getAuthorizationUrlHosted,
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const user = await getUser(supabase);

    // Generate PKCE values
    const codeVerifier = generateCodeVerifier();

    // Store code verifier for later use
    localStorage.setItem("thetoolkit_twitter_code_verifier", codeVerifier);
    // TODO: store challenge in db. expire in 10 minutes.

    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/hosted/twitter/oauth/callback`;

    const authUrl = getAuthorizationUrlHosted(
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
