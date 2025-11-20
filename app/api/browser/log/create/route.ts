import { NextRequest, NextResponse } from "next/server";

import { logClientEvent } from "@/lib/logs";
import { getIpAddressFromRequest } from "@/lib/request";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient();

    const { eventData, eventType, mode, serviceId } = await request.json();

    // Extract IP address from request headers
    const ipAddress = getIpAddressFromRequest(request);

    await logClientEvent({
      eventData,
      eventType,
      ipAddress,
      mode,
      serviceId,
      supabaseAdmin,
    });

    return NextResponse.json({ message: "Event logged" }, { status: 200 });
  } catch (err: unknown) {
    const errMessage =
      err instanceof Error ? err.message : "Event logging failed";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
