import { NextResponse } from "next/server";

import { getClientMetadata } from "@/services/post/bluesky/oauth-client-node";

export function GET() {
  const metadata = getClientMetadata();

  return NextResponse.json(metadata);
}
