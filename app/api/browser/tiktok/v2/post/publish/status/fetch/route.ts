import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 },
      );
    }

    // Make the call to TikTok's API from the server
    const response = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/status/fetch/",
      {
        body: JSON.stringify(await request.json()),
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json; charset=UTF-8",
        },
        method: "POST",
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          details: errorData,
          error: `TikTok API Error: ${errorData.error?.message ?? response.statusText}`,
        },
        { status: response.status },
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (err: unknown) {
    const errMessage =
      err instanceof Error ? err.message : "Status check failed";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
