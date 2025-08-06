import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/server/auth";

// app/api/bluesky/tokens/refresh/route.ts
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 },
      );
    }

    const { credentials } = await request.json();

    const storedTokens = await getBlueskyTokens(userId, credentials);

    if (!storedTokens) {
      return NextResponse.json(
        {
          error: "No tokens found. Please re-authorize.",
          success: false,
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
        accessTokenExpiresAt: newTokenData.accessTokenExpiresAt,
        credentials: storedTokens.credentials,
        refreshTokenExpiresAt: newTokenData.refreshTokenExpiresAt,
        serviceUrl: storedTokens.serviceUrl,
        sessionData: await encryptData(newTokenData.sessionData),
      });

      return NextResponse.json({
        accessToken: session.sub,
        expiresAt: newTokenData.refreshTokenExpiresAt,
        success: true,
      });
    } catch (sessionError) {
      console.error("Session refresh failed:", sessionError);

      return NextResponse.json(
        {
          error: "Session refresh failed. Please re-authorize.",
          success: false,
        },
        { status: 401 },
      );
    }
  } catch (error: unknown) {
    console.error("Refresh token error:", error);
    const errMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: `Failed to refresh token: ${errMessage}`,
        success: false,
      },
      { status: 500 },
    );
  }
}
