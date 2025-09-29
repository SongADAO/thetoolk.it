import { NextResponse } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { createSignedVideoURL } from "@/services/storage/pinata/store";

export async function POST() {
  try {
    await initServerAuth();

    const url = await createSignedVideoURL();

    return NextResponse.json({ url });
  } catch (err: unknown) {
    console.error("Error creating presigned video upload URL:", err);
    const errMessage =
      err instanceof Error
        ? err.message
        : "Failed to create presigned video URL";

    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
