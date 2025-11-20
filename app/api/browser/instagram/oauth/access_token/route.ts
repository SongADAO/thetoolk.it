import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();

    // Create URLSearchParams from the URL-encoded string
    const params = new URLSearchParams(bodyText);

    // Make the call to TikTok's API from the server
    const response = await fetch(
      "https://api.instagram.com/oauth/access_token",
      {
        body: params,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          details: errorData,
          error: `Instagram API Error: ${errorData.error?.message ?? response.statusText}`,
        },
        { status: response.status },
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Auth failed";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
