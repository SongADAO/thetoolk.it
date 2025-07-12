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

    const response = await fetch("https://api.x.com/2/posts", {
      body: JSON.stringify(body),
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(
        { error: errorData.detail ?? errorData.title ?? "Unknown error" },
        { status: response.status },
      );
    }

    const result = await response.json();
    return Response.json(result);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Post failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
