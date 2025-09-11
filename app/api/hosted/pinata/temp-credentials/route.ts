import { NextResponse } from "next/server";
import { PinataSDK } from "pinata";

import { HOSTED_ADMIN_CREDENTIALS } from "@/services/storage/pinata/store";

export async function POST() {
  try {
    const pinata = new PinataSDK({
      pinataJwt: HOSTED_ADMIN_CREDENTIALS.jwt,
    });

    // Create temporary scoped API key
    const tempKey = await pinata.keys.create({
      keyName: `temp-hls-upload-${Date.now()}`,
      maxUses: 1,
      permissions: {
        admin: false,
        endpoints: {
          data: {
            pinList: false,
            userPinnedDataTotal: false,
          },
          pinning: {
            hashMetadata: false,
            hashPinPolicy: false,
            pinByHash: false,
            pinFileToIPFS: true,
            pinJSONToIPFS: false,
            pinJobs: false,
            unpin: false,
            userPinPolicy: false,
          },
        },
      },
    });

    return NextResponse.json(tempKey);
  } catch (error: unknown) {
    console.error("Error creating temporary credentials:", error);
    const errMessage =
      error instanceof Error
        ? error.message
        : "Failed to create temporary credentials";

    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
