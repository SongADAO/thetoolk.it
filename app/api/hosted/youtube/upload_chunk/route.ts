import { NextRequest } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { getServiceAuthorization } from "@/lib/supabase/service";
import { uploadFileChunk } from "@/services/post/youtube/post";

export async function POST(request: NextRequest) {
  try {
    const authorization = await getServiceAuthorization({
      ...(await initServerAuth()),
      serviceId: "youtube",
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

    const data = {
      chunk,
      chunkEnd,
      chunkSize,
      totalBytes,
      uploadUrl,
      uploadedBytes,
    };

    const response = await uploadFileChunk({
      ...data,
      accessToken: authorization.authorization.accessToken,
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: { message: errMessage } }, { status: 500 });
  }
}
