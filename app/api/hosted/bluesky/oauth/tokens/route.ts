// app/api/bluesky/tokens/route.ts
import { NextRequest, NextResponse } from "next/server";

import {
  decryptData,
  getBlueskyTokens,
  getCurrentUserId,
  isTokenExpired,
} from "@/lib/server/auth";
import { restoreSession } from "@/services/post/bluesky/oauth-client-node";

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

    // Get stored tokens from database
    const storedTokens = await getBlueskyTokens(userId, credentials);

    if (!storedTokens) {
      return NextResponse.json(
        {
          success: false,
          error: "No tokens found. Please re-authorize.",
        },
        { status: 404 },
      );
    }

    // Check if refresh token is still valid
    if (isTokenExpired(storedTokens.refreshTokenExpiresAt)) {
      return NextResponse.json(
        {
          success: false,
          error: "Session expired. Please re-authorize.",
        },
        { status: 401 },
      );
    }

    try {
      // Restore session using stored session data
      const sessionData = await decryptData(storedTokens.sessionData);
      const session = await restoreSession(credentials, sessionData);

      // Session restoration automatically handles token refresh if needed
      return NextResponse.json({
        success: true,
        accessToken: session.sub, // In AT Protocol, the access token is the DID
        expiresAt: storedTokens.refreshTokenExpiresAt,
      });
    } catch (sessionError) {
      console.error("Session restore failed:", sessionError);

      // If session restore fails, the user needs to re-authorize
      return NextResponse.json(
        {
          success: false,
          error: "Session invalid. Please re-authorize.",
        },
        { status: 401 },
      );
    }
  } catch (error: unknown) {
    console.error("Get token error:", error);
    const errMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: `Failed to get access token: ${errMessage}`,
      },
      { status: 500 },
    );
  }
}
