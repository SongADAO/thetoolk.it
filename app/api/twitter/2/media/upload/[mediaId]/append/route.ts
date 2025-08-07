import { NextRequest } from "next/server";

interface RouteParams {
  params: {
    media_id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return Response.json(
        { error: "Authorization header required" },
        { status: 401 },
      );
    }

    const response = await fetch(
      `https://api.x.com/2/media/upload/${params.media_id}/append`,
      {
        body: await request.formData(),
        headers: {
          Authorization: authHeader,
        },
        method: "POST",
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json(
        { error: `Chunk upload failed: ${errorText}` },
        { status: response.status },
      );
    }

    // Twitter returns empty response for successful APPEND
    return Response.json({ success: true });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Append failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
