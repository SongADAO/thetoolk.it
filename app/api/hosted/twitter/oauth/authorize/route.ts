import { NextResponse } from "next/server";

import {
  generateCodeChallenge,
  generateCodeVerifier,
} from "@/lib/code-verifier";
import { initServerAuth } from "@/lib/supabase/hosted-api";
import { updateCodeVerifier } from "@/lib/supabase/service";
import { getHostedBaseUrl } from "@/services/post/hosted";
import {
  getTwitterAuthorizeUrl,
  HOSTED_CREDENTIALS as HOSTED_CREDENTIALS_TWITTER,
} from "@/services/post/twitter/auth";

export async function POST() {
  try {
    const serverAuth = await initServerAuth();

    // Generate PKCE values
    const codeVerifier = generateCodeVerifier();

    await updateCodeVerifier({
      ...serverAuth,
      codeVerifier,
      serviceId: "twitter",
    });

    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const redirectUri = `${getHostedBaseUrl()}/api/hosted/twitter/oauth/callback`;

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
