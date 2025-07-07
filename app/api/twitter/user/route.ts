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

    const response = await fetch("https://api.twitter.com/2/users/me", {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return Response.json(
        { error: error.detail ?? response.statusText },
        { status: response.status },
      );
    }

    const userData = await response.json();
    return Response.json(userData);
  } catch (err: unknown) {
    const errMessage =
      err instanceof Error ? err.message : "Authentication failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
