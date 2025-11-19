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

    const response = await fetch(
      "https://api.x.com/2/media/upload/initialize",
      {
        body: JSON.stringify(await request.json()),
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
        { error: `Upload initialization failed: ${errorText}` },
        { status: response.status },
      );
    }

    const result = await response.json();
    return Response.json(result);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Initialize failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
