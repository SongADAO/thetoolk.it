import { NextRequest, NextResponse } from "next/server";

import { getClientMetadata } from "@/services/post/bluesky/oauth-client-node";
import { getBaseUrlFromRequest } from "@/services/post/hosted";

export function GET(request: NextRequest) {
  const metadata = getClientMetadata(getBaseUrlFromRequest(request));

  return NextResponse.json(metadata);
}
