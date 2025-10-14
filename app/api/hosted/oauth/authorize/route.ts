import { NextRequest, NextResponse } from "next/server";

import {
  generateCodeChallenge,
  generateCodeVerifier,
} from "@/lib/code-verifier";
import { initServerAuth } from "@/lib/supabase/hosted-api";
import { updateCodeVerifier } from "@/lib/supabase/service";
import { getAuthorizeUrl, getBaseUrlFromRequest } from "@/services/post/hosted";

export async function POST(request: NextRequest) {
  try {
    const { serviceId } = await request.json();

    const serverAuth = await initServerAuth();

    // Generate PKCE values
    const codeVerifier = generateCodeVerifier();

    await updateCodeVerifier({
      ...serverAuth,
      codeVerifier,
      serviceId,
    });

    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const url = new URL(getBaseUrlFromRequest(request));
    const redirectUri = `${url.protocol}//${url.host}/api/hosted/oauth/callback`;

    const authUrl = getAuthorizeUrl(serviceId, redirectUri, codeChallenge);

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
