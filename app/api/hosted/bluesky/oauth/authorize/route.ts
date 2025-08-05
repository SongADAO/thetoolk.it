// app/api/bluesky/oauth/authorize/route.ts
import { NextRequest, NextResponse } from "next/server";

import { getAuthorizationUrl } from "@/services/post/bluesky/oauth-client-node";

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    console.log("Generating authorization URL for user:", username);

    const authUrl = await getAuthorizationUrl(username);

    return NextResponse.json({
      authUrl,
      success: true,
    });
  } catch (error: unknown) {
    console.error("Authorization URL generation error:", error);
    const errMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: `Failed to generate authorization URL: ${errMessage}`,
        success: false,
      },
      { status: 500 },
    );
  }
}
