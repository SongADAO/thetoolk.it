import { NextRequest } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { getServiceAuthorization } from "@/lib/supabase/service";
import { getAccountAccessToken } from "@/services/post/facebook/auth";
import { uploadVideo } from "@/services/post/facebook/post";

export async function POST(request: NextRequest) {
  try {
    const serviceId = "facebook";

    const serverAuth = await initServerAuth();

    const serviceAuthorization = await getServiceAuthorization(
      serverAuth.supabase,
      serverAuth.user,
      serviceId,
    );

    const formData = await request.json();

    const accessToken = await getAccountAccessToken(
      serviceAuthorization.accessToken,
      formData.userId,
    );

    const postId = await uploadVideo({ ...formData, accessToken });

    return Response.json({ id: postId });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: { message: errMessage } }, { status: 500 });
  }
}
