import { NextRequest, NextResponse } from "next/server";

import { getBaseUrlFromRequest } from "@/lib/request";
import { getClientMetadata } from "@/services/post/bluesky/oauth-client-node";

export function GET(request: NextRequest) {
  const metadata = getClientMetadata(getBaseUrlFromRequest(request));

  return NextResponse.json(metadata);
}
