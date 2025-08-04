import { NextRequest } from "next/server";

import {
  exchangeCodeForTokens,
  HOSTED_CREDENTIALS,
} from "@/services/post/bluesky/auth";

export async function POST(request: NextRequest) {
  try {
    return exchangeCodeForTokens(HOSTED_CREDENTIALS);
  } catch (err: unknown) {
    console.error(err);
    const errMessage = err instanceof Error ? err.message : "Auth failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
