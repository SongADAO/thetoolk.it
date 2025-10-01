import { NextResponse } from "next/server";

import {
  generateCodeChallenge,
  generateCodeVerifier,
} from "@/lib/code-verifier";
import { initServerAuth } from "@/lib/supabase/hosted-api";
import { updateCodeVerifier } from "@/lib/supabase/service";
import { getBaseUrl } from "@/services/post/hosted";
import {
  getTwitterAuthorizeUrl,
  HOSTED_CREDENTIALS as HOSTED_CREDENTIALS_TWITTER,
} from "@/services/post/twitter/auth";

export async function POST() {
  try {
    const serviceId = "twitter";
    const serverAuth = await initServerAuth();

    // Generate PKCE values
    const codeVerifier = generateCodeVerifier();

    await updateCodeVerifier({
      ...serverAuth,
      codeVerifier,
      serviceId,
    });

    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const redirectUri = `${getBaseUrl()}/api/hosted/twitter/oauth/callback`;

    const authUrl = getTwitterAuthorizeUrl(
      HOSTED_CREDENTIALS_TWITTER.clientId,
      redirectUri,
      codeChallenge,
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
