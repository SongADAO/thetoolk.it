import { NextResponse } from "next/server";

import { createSignedHLSFolderURL } from "@/services/storage/pinata/store";

export async function POST() {
  try {
    const url = await createSignedHLSFolderURL();

    return NextResponse.json({ url });
  } catch (error: unknown) {
    console.error("Error creating presigned HLS video upload URL:", error);
    const errMessage =
      error instanceof Error
        ? error.message
        : "Failed to create presigned HLS video URL";

    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
