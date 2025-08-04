import { NextRequest } from "next/server";

import {
  exchangeCodeForTokens,
  HOSTED_CREDENTIALS,
} from "@/services/post/bluesky/auth";

export async function POST(request: NextRequest) {
  try {
    const result = exchangeCodeForTokens(HOSTED_CREDENTIALS);

    return Response.json(result);
  } catch (err: unknown) {
    console.error(err);
    const errMessage = err instanceof Error ? err.message : "Auth failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
