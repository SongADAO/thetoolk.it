import { NextRequest, NextResponse } from "next/server";

import { logServerPost } from "@/lib/logs";
import { gateHasActiveSubscription } from "@/lib/subscriptions";
import { initServerAuth } from "@/lib/supabase/server-auth";
import { getServiceAuthorizationAndExpiration } from "@/lib/supabase/service";
import { uploadFileChunk } from "@/services/post/youtube/post";

export async function POST(request: NextRequest) {
  const serviceId = "youtube";

  try {
    const serverAuth = await initServerAuth();
    await gateHasActiveSubscription({ ...serverAuth });

    const authorization = await getServiceAuthorizationAndExpiration({
      ...serverAuth,
      serviceId,
    });

    // Parse FormData instead of JSON
    const formData = await request.formData();

    // Extract fields from FormData
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const chunk = formData.get("chunk") as Blob;
    const chunkEnd = parseInt(String(formData.get("chunkEnd")), 10);
    const chunkSize = parseInt(String(formData.get("chunkSize")), 10);
    const totalBytes = parseInt(String(formData.get("totalBytes")), 10);
    const uploadUrl = String(formData.get("uploadUrl"));
    const uploadedBytes = parseInt(String(formData.get("uploadedBytes")), 10);

    const response = await uploadFileChunk({
      accessToken: authorization.authorization.accessToken,
      chunk,
      chunkEnd,
      chunkSize,
      totalBytes,
      uploadUrl,
      uploadedBytes,
    });

    if (response.status === 200 || response.status === 201) {
      const responseData = await response.json();

      await logServerPost({
        ...serverAuth,
        postData: {
          chunkEnd,
          chunkSize,
          postId: responseData.id,
          totalBytes,
          uploadUrl,
          uploadedBytes,
        },
        serviceId,
        statusId: 2,
      });
    }

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { error: { message: errMessage } },
      { status: 500 },
    );
  }
}
