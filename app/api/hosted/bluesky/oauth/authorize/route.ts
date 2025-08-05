// app/api/bluesky/oauth/authorize/route.ts
import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/server/auth";
import { createAuthorizationUrl } from "@/services/post/bluesky/oauth-client-server";

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

    console.log("Generating authorization URL for user:", userId);

    const authUrl = await createAuthorizationUrl(credentials, userId);

    return NextResponse.json({
      success: true,
      authUrl,
    });
  } catch (error: unknown) {
    console.error("Authorization URL generation error:", error);
    const errMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: `Failed to generate authorization URL: ${errMessage}`,
      },
      { status: 500 },
    );
  }
}
