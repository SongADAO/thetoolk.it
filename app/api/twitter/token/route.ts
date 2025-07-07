export async function POST(request) {
  try {
    const { code, client_id, client_secret, redirect_uri, code_verifier } =
      await request.json();

    const tokenResponse = await fetch(
      "https://api.twitter.com/2/oauth2/token",
      {
        body: new URLSearchParams({
          code,
          grant_type: "authorization_code",
          client_id,
          redirect_uri,
          code_verifier,
        }),
        headers: {
          Authorization: `Basic ${btoa(`${client_id}:${client_secret}`)}`,
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
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
