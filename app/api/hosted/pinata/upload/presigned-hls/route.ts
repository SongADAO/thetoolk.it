import { NextResponse } from "next/server";

import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import { createSignedHLSFolderURL } from "@/services/storage/pinata/store";

export async function POST() {
  try {
    const serverAuth = await initServerAuth();
    await gateHasActiveSubscription({ ...serverAuth });

    const url = await createSignedHLSFolderURL();

    return NextResponse.json({ url });
  } catch (err: unknown) {
    console.error("Error creating presigned HLS video upload URL:", err);
    const errMessage =
      err instanceof Error
        ? err.message
        : "Failed to create presigned HLS video URL";

    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
