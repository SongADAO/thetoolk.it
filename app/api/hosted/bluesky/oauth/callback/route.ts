// app/api/bluesky/oauth/callback/route.ts
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

import {
  encryptData,
  getBlueskyCredentials,
  storeBlueskyTokens,
} from "@/lib/server/auth";
import { handleCallback } from "@/services/post/bluesky/oauth-client-server";

function formatTokens(session: any) {
  // Sessions in AT Protocol OAuth have their own expiration handling
  // We'll store the session data itself rather than individual tokens
  const now = new Date();

  // Access tokens typically expire in 2 hours
  const accessTokenExpiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  // Refresh tokens typically expire in 7 days
  const refreshTokenExpiresAt = new Date(
    now.getTime() + 7 * 24 * 60 * 60 * 1000,
  );

  return {
    sessionData: JSON.stringify(session),
    accessTokenExpiresAt: accessTokenExpiresAt.toISOString(),
    refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const iss = searchParams.get("iss");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle OAuth errors
    if (error) {
      console.error("OAuth callback error:", error, errorDescription);
      const errorUrl = new URL(process.env.NEXT_PUBLIC_BASE_URL || "");
      errorUrl.searchParams.set("error", error);
      if (errorDescription) {
        errorUrl.searchParams.set("error_description", errorDescription);
      }
      return redirect(errorUrl.toString());
    }

    if (!code || !iss || !state) {
      console.error("Missing OAuth callback parameters");
      const errorUrl = new URL(process.env.NEXT_PUBLIC_BASE_URL || "");
      errorUrl.searchParams.set("error", "missing_parameters");
      return redirect(errorUrl.toString());
    }

    console.log("Processing OAuth callback...");

    // Extract userId from state
    const userId = state;

    // Get user's credentials if they exist
    const credentials = await getBlueskyCredentials(userId);

    // Handle the callback using the node OAuth client
    const { session } = await handleCallback(searchParams, credentials);

    console.log("OAuth session created successfully");

    const tokenData = formatTokens(session);

    // Store session data securely in database
    await storeBlueskyTokens(userId, {
      sessionData: await encryptData(tokenData.sessionData),
      accessTokenExpiresAt: tokenData.accessTokenExpiresAt,
      refreshTokenExpiresAt: tokenData.refreshTokenExpiresAt,
      serviceUrl:
        credentials?.serviceUrl ||
        process.env.NEXT_PUBLIC_BLUESKY_SERVICE_URL ||
        "https://bsky.social",
      credentials: credentials
        ? await encryptData(JSON.stringify(credentials))
        : null,
    });

    console.log("Tokens stored successfully");

    // Redirect back to the application
    const redirectUrl = new URL(process.env.NEXT_PUBLIC_BASE_URL || "");
    redirectUrl.searchParams.set("auth", "success");

    return redirect(redirectUrl.toString());
  } catch (error: unknown) {
    console.error("OAuth callback error:", error);
    const errMessage = error instanceof Error ? error.message : "Unknown error";

    // Redirect to app with error
    const errorUrl = new URL(process.env.NEXT_PUBLIC_BASE_URL || "");
    errorUrl.searchParams.set("error", "callback_failed");
    errorUrl.searchParams.set("error_description", errMessage);

    return redirect(errorUrl.toString());
  }
}
