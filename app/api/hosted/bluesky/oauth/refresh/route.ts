import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/server/auth";

// app/api/bluesky/tokens/refresh/route.ts
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

    try {
      // Restore session (this automatically refreshes tokens if needed)
      const sessionData = await decryptData(storedTokens.sessionData);
      const session = await restoreSession(credentials, sessionData);

      // Update stored session data if it changed
      const newTokenData = formatTokens(session);
      await storeBlueskyTokens(userId, {
        sessionData: await encryptData(newTokenData.sessionData),
        accessTokenExpiresAt: newTokenData.accessTokenExpiresAt,
        refreshTokenExpiresAt: newTokenData.refreshTokenExpiresAt,
        serviceUrl: storedTokens.serviceUrl,
        credentials: storedTokens.credentials,
      });

      return NextResponse.json({
        success: true,
        accessToken: session.sub,
        expiresAt: newTokenData.refreshTokenExpiresAt,
      });
    } catch (sessionError) {
      console.error("Session refresh failed:", sessionError);

      return NextResponse.json(
        {
          success: false,
          error: "Session refresh failed. Please re-authorize.",
        },
        { status: 401 },
      );
    }
  } catch (error: unknown) {
    console.error("Refresh token error:", error);
    const errMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: `Failed to refresh token: ${errMessage}`,
      },
      { status: 500 },
    );
  }
}
