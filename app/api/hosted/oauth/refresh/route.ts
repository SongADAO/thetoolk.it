import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { refreshAccessToken } from "@/services/post/facebook/auth";

async function getUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function POST(request: NextRequest) {
  try {
    const { serviceId } = await request.json();

    const supabase = await createClient();

    const user = await getUser(supabase);

    const { data, error } = await supabase
      .from("services")
      .select("service_authorization")
      .eq("user_id", user.id)
      .eq("service_id", serviceId)
      .single();

    if (error) {
      throw new Error("Could not get tokens to refresh from DB");
    }

    const authorization = data.service_authorization;

    if (!authorization) {
      throw new Error("Could not get tokens to refresh");
    }

    const newAuthorization = await refreshAccessToken(authorization);

    const { error: authorizationError } = await supabase
      .from("services")
      .upsert(
        {
          service_authorization: newAuthorization,
          service_id: serviceId,
          user_id: user.id,
        },
        {
          onConflict: "user_id,service_id",
        },
      );

    if (authorizationError) {
      throw new Error("Could not refresh token");
    }

    return Response.json({ success: true });
  } catch (err: unknown) {
    console.error(err);
    const errMessage = err instanceof Error ? err.message : "Auth failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
