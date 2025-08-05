import { NextResponse } from "next/server";

import { getClientMetadata } from "@/services/post/bluesky/oauth-client-browser";

export function GET() {
  const metadata = getClientMetadata();

  return NextResponse.json(metadata);
}
