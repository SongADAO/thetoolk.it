import { NextResponse } from "next/server";

import { createSignedVideoURL } from "@/services/storage/pinata/store";

export async function POST() {
  try {
    const url = await createSignedVideoURL();

    return NextResponse.json({ url });
  } catch (error: unknown) {
    console.error("Error creating presigned video upload URL:", error);
    const errMessage =
      error instanceof Error
        ? error.message
        : "Failed to create presigned video URL";

    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
