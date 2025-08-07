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

    const response = await fetch(
      `https://api.x.com/2/media/upload?${request.nextUrl.searchParams.toString()}`,
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
