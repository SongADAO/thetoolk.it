import { NextRequest } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { getServiceAuthorization } from "@/lib/supabase/service";
import { appendUploadVideo } from "@/services/post/twitter/post";

export async function POST(request: NextRequest) {
  try {
    const authorization = await getServiceAuthorization({
      ...(await initServerAuth()),
      serviceId: "twitter",
    });

    // Parse FormData instead of JSON
    const formData = await request.formData();

    // Extract fields from FormData
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const chunk = formData.get("chunk") as Blob;
    const mediaId = String(formData.get("mediaId"));
    const segmentIndex = parseInt(String(formData.get("segmentIndex")), 10);

    const data = {
      chunk,
      mediaId,
      segmentIndex,
    };

    const response = await appendUploadVideo({
      ...data,
      accessToken: authorization.authorization.accessToken,
      mode: "hosted",
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
