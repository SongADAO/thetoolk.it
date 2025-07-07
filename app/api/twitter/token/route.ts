import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code, clientId, clientSecret, redirectUri, codeVerifier } =
      await request.json();

    const tokenResponse = await fetch(
      "https://api.twitter.com/2/oauth2/token",
      {
        body: new URLSearchParams({
          client_id: clientId,
          code,
          code_verifier: codeVerifier,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
        headers: {
          Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      },
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      return Response.json(
        { error: errorData.error_description ?? errorData.error },
        { status: tokenResponse.status },
      );
    }

    const tokens = await tokenResponse.json();
    return Response.json(tokens);
  } catch (err: unknown) {
    const errMessage =
      err instanceof Error ? err.message : "Authentication failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
