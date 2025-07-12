// app/api/farcaster/cast/route.js
import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";
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

    const client = new NeynarAPIClient(
      new Configuration({ apiKey: authHeader }),
    );

    const { cast } = await client.publishCast(body);

    return Response.json({ cast, success: true });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Post failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
