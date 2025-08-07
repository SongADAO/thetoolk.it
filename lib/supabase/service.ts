import type { SupabaseClient, User } from "@supabase/supabase-js";

interface GetServiceAuthorization {
  serviceId: string;
  supabase: SupabaseClient;
  user: User;
}

async function getServiceAuthorization({
  serviceId,
  supabase,
  user,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: GetServiceAuthorization): Promise<any> {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceAuthorization: any;
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

interface UpdateServiceAccounts {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceAccounts: any;
  serviceId: string;
  supabase: SupabaseClient;
  user: User;
}

async function updateServiceAccounts({
  serviceAccounts,
  serviceId,
  supabase,
  user,
}: UpdateServiceAccounts): Promise<void> {
  const { error } = await supabase.from("services").upsert(
    {
      service_accounts: serviceAccounts,
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

interface UpdateServiceAuthorizationAndAccounts {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceAccounts: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceAuthorization: any;
  serviceId: string;
  supabase: SupabaseClient;
  user: User;
}

async function updateServiceAuthorizationAndAccounts({
  serviceAccounts,
  serviceAuthorization,
  serviceId,
  supabase,
  user,
}: UpdateServiceAuthorizationAndAccounts): Promise<void> {
  const { error } = await supabase.from("services").upsert(
    {
      service_accounts: serviceAccounts,
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

export {
  getServiceAuthorization,
  updateServiceAccounts,
  updateServiceAuthorization,
  updateServiceAuthorizationAndAccounts,
};
