import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/server/auth";

// app/api/bluesky/status/route.ts
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ isAuthorized: false });
    }

    const { credentials } = await request.json();

    const storedTokens = await getBlueskyTokens(userId, credentials);

    if (!storedTokens) {
      return NextResponse.json({ isAuthorized: false });
    }

    // Check if refresh token is still valid
    const isAuthorized = !isTokenExpired(storedTokens.refreshTokenExpiresAt);

    let accounts: ServiceAccount[] = [];

    if (isAuthorized) {
      try {
        const sessionData = await decryptData(storedTokens.sessionData);
        const session = await restoreSession(credentials, sessionData);

        const agent = new Agent(session);
        const profile = await agent.getProfile({ actor: session.sub });

        accounts = [
          {
            id: session.sub,
            username: profile.data.handle,
          },
        ];
      } catch (error) {
        console.log("Could not fetch accounts:", error);
        // Still authorized, just couldn't fetch accounts
      }
    }

    return NextResponse.json({
      isAuthorized,
      expiresAt: storedTokens.refreshTokenExpiresAt,
      accounts,
    });
  } catch (error: unknown) {
    console.error("Status check error:", error);
    return NextResponse.json({ isAuthorized: false });
  }
}
