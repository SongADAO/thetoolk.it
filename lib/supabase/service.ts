import type { SupabaseClient, User } from "@supabase/supabase-js";

import { OauthAuthorization } from "@/services/post/types";

async function getServiceAuthorization(
  supabase: SupabaseClient,
  user: User,
  serviceId: string,
): Promise<OauthAuthorization> {
  const { data, error } = await supabase
    .from("services")
    .select("service_authorization")
    .eq("user_id", user.id)
    .eq("service_id", serviceId)
    .single();

  if (error) {
    throw new Error("Error fetching service authorization");
  }

  if (!data.service_authorization) {
    throw new Error("Could not find service authorization");
  }

  return data.service_authorization;
}

async function updateServiceAuthorization(
  supabase: SupabaseClient,
  user: User,
  serviceId: string,
  newAuthorization: OauthAuthorization,
) {
  const { error } = await supabase.from("services").upsert(
    {
      service_authorization: newAuthorization,
      service_id: serviceId,
      user_id: user.id,
    },
    {
      onConflict: "user_id,service_id",
    },
  );

  if (error) {
    throw new Error("Could not update service authorization");
  }
}

export { getServiceAuthorization, updateServiceAuthorization };
