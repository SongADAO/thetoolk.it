import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/server/auth";

// app/api/bluesky/accounts/route.ts
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
      const sessionData = await decryptData(storedTokens.sessionData);
      const session = await restoreSession(credentials, sessionData);

      // Create agent to get profile information
      const agent = new Agent(session);
      const profile = await agent.getProfile({ actor: session.sub });

      const accounts: ServiceAccount[] = [
        {
          id: session.sub,
          username: profile.data.handle,
        },
      ];

      return NextResponse.json({
        success: true,
        accounts,
      });
    } catch (sessionError) {
      console.error("Get accounts session error:", sessionError);

      return NextResponse.json(
        {
          success: false,
          error: "Session invalid. Please re-authorize.",
        },
        { status: 401 },
      );
    }
  } catch (error: unknown) {
    console.error("Get accounts error:", error);
    const errMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: `Failed to get accounts: ${errMessage}`,
      },
      { status: 500 },
    );
  }
}
