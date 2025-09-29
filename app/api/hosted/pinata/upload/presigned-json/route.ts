import { NextResponse } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { createSignedJsonURL } from "@/services/storage/pinata/store";

export async function POST() {
  try {
    await initServerAuth();

    const url = await createSignedJsonURL();

    return NextResponse.json({ url });
  } catch (err: unknown) {
    console.error("Error creating presigned json upload URL:", err);
    const errMessage =
      err instanceof Error
        ? err.message
        : "Failed to create presigned json URL";

    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
