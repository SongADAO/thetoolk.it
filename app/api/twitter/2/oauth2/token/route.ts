import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    const headers = new Headers();
    headers.set("Content-Type", "application/x-www-form-urlencoded");

    if (authHeader) {
      headers.set("Authorization", authHeader);
    }

    const params = await request.json();
    const response = await fetch("https://api.twitter.com/2/oauth2/token", {
      body: new URLSearchParams(params),
      headers,
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(
        { error: errorData.error_description ?? errorData.error },
        { status: response.status },
      );
    }

    const tokens = await response.json();
    return Response.json(tokens);
  } catch (err: unknown) {
    const errMessage =
      err instanceof Error ? err.message : "Authentication failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
