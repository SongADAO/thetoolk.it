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
      `https://api.x.com/2/media/upload/${params.media_id}/finalize`,
      {
        body: JSON.stringify({}),
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json(
        { error: `Upload finalization failed: ${errorText}` },
        { status: response.status },
      );
    }

    const result = await response.json();
    return Response.json(result);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Finalize failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
