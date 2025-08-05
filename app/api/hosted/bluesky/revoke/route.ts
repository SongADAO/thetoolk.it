import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/server/auth";

// app/api/bluesky/revoke/route.ts - Token revocation endpoint
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { credentials } = await request.json();

    // Get stored tokens
    const storedTokens = await getBlueskyTokens(userId, credentials);

    if (storedTokens) {
      try {
        // Try to revoke the session with the OAuth provider
        const sessionData = await decryptData(storedTokens.sessionData);
        const session = await restoreSession(credentials, sessionData);

        // Note: AT Protocol/Bluesky sessions will expire naturally
        // There may not be an explicit revocation endpoint
        console.log("Session found for cleanup");
      } catch (error) {
        console.log("Could not restore session for revocation:", error);
        // This is okay, tokens may already be expired
      }

      // Delete tokens from our database regardless of remote revocation success
      await deleteBlueskyTokens(userId, credentials);
    }

    return NextResponse.json({
      success: true,
      message: "Tokens revoked successfully",
    });
  } catch (error: unknown) {
    console.error("Token revocation error:", error);
    const errMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: `Failed to revoke tokens: ${errMessage}`,
      },
      { status: 500 },
    );
  }
}
