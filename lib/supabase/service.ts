import type { SupabaseClient, User } from "@supabase/supabase-js";

import { OauthAuthorization } from "@/services/post/types";

interface GetServiceAuthorization {
  serviceId: string;
  supabase: SupabaseClient;
  user: User;
}

async function getServiceAuthorization({
  serviceId,
  supabase,
  user,
}: GetServiceAuthorization): Promise<OauthAuthorization> {
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

interface UpdateServiceAuthorization {
  serviceAuthorization: OauthAuthorization;
  serviceId: string;
  supabase: SupabaseClient;
  user: User;
}

async function updateServiceAuthorization({
  serviceAuthorization,
  serviceId,
  supabase,
  user,
}: UpdateServiceAuthorization): Promise<void> {
  const { error } = await supabase.from("services").upsert(
    {
      service_authorization: serviceAuthorization,
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
