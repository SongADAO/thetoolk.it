import { NextResponse } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { createSignedHLSFolderURL } from "@/services/storage/pinata/store";

export async function POST() {
  try {
    const serverAuth = await initServerAuth();

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
