import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return Response.json(
        { error: "Authorization header required" },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Make the call to TikTok's API from the server
    const publishResponse = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/video/init/",
      {
        body: JSON.stringify(body),
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json; charset=UTF-8",
        },
        method: "POST",
      },
    );

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json();
      return Response.json(
        {
          details: errorData,
          error: `TikTok API Error: ${errorData.error?.message ?? publishResponse.statusText}`,
        },
        { status: publishResponse.status },
      );
    }

    const publishData = await publishResponse.json();

    return Response.json({
      data: publishData.data,
      publish_id: publishData.data.publish_id,
      success: true,
    });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Post failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
