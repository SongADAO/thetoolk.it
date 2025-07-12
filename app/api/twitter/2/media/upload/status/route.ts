import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return Response.json(
        { error: "Authorization header required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("media_id");

    if (!mediaId) {
      return Response.json(
        { error: "media_id parameter required" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `https://api.x.com/2/media/upload?command=STATUS&media_id=${mediaId}`,
      {
        headers: {
          Authorization: authHeader,
        },
        method: "GET",
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json(
        { error: `Status check failed: ${errorText}` },
        { status: response.status },
      );
    }

    const result = await response.json();
    return Response.json(result);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Status failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
