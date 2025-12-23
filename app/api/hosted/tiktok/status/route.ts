import { NextRequest, NextResponse } from "next/server";

import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  const serviceId = "tiktok";

  try {
    const serverAuth = await initServerAuth();
    await gateHasActiveSubscription({ ...serverAuth });

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId,
    });

    const { publish_id: publishId } = await request.json();

    if (!publishId) {
      return NextResponse.json(
        { error: { message: "publish_id is required" } },
        { status: 400 },
      );
    }

    // Make the call to TikTok's API from the server
    const response = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/status/fetch/",
      {
        body: JSON.stringify({
          publish_id: publishId,
        }),
        headers: {
          Authorization: `Bearer ${authorization.authorization.accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        method: "POST",
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          error: {
            message: `TikTok API Error: ${errorData.error?.message ?? response.statusText}`,
          },
        },
        { status: response.status },
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Status check failed";
    return NextResponse.json(
      { error: { message: errMessage } },
      { status: 500 },
    );
  }
}
