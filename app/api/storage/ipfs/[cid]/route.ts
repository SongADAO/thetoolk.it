import { NextRequest, NextResponse } from "next/server";

import { HOSTED_CREDENTIALS } from "@/services/storage/pinata/store";

export async function GET(request: NextRequest) {
  const currentUrl = new URL(request.url);

  // Build the target URL
  const targetUrl = new URL(
    currentUrl.pathname.replace("/api/storage", "") + currentUrl.search,
    `https://${HOSTED_CREDENTIALS.gateway}`,
  );

  try {
    // Fetch the video from the target URL
    const response = await fetch(targetUrl.toString());

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch video" },
        { status: response.status },
      );
    }

    // Get the video data as a blob
    const videoBlob = await response.blob();

    // Return the video with appropriate headers
    return new NextResponse(videoBlob, {
      headers: {
        // Support for video streaming/range requests
        "Accept-Ranges": "bytes",
        "Cache-Control":
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          response.headers.get("Cache-Control") || "public, max-age=31536000",
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        "Content-Length": response.headers.get("Content-Length") || "",
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        "Content-Type": response.headers.get("Content-Type") || "video/mp4",
      },
      status: 200,
    });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
