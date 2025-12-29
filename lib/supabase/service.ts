import type { SupabaseClient, User } from "@supabase/supabase-js";

import {
  decryptServiceAuthorization,
  encryptServiceAuthorization,
  getEncryptionKey,
} from "@/lib/crypto";

interface ServiceAuthorization {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authorization: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expiration: any;
}

interface GetServiceAuthorization {
  serviceId: string;
  supabaseAdmin: SupabaseClient;
  user: User;
}

async function getServiceAuthorizationAndExpiration({
  serviceId,
  supabaseAdmin,
  user,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: GetServiceAuthorization): Promise<ServiceAuthorization> {
  const { data: dataAuthorization, error: errorAuthorization } =
    await supabaseAdmin
      .from("service_authorizations")
      .select("service_authorization")
      .eq("user_id", user.id)
      .eq("service_id", serviceId)
      .single();

  if (errorAuthorization) {
    throw new Error("Error fetching service authorization");
  }

  if (!dataAuthorization.service_authorization) {
    throw new Error("Could not find service authorization");
  }

  // Decrypt the service authorization
  const encryptionKey = getEncryptionKey();
  const decryptedAuthorization =
    dataAuthorization.service_authorization === null
      ? null
      : decryptServiceAuthorization(
          dataAuthorization.service_authorization,
          encryptionKey,
        );

  const { data: dataExpiration, error: errorExpiration } = await supabaseAdmin
    .from("services")
    .select("service_expiration")
    .eq("user_id", user.id)
    .eq("service_id", serviceId)
    .single();

  if (errorExpiration) {
    throw new Error("Error fetching service authorization");
  }

  if (!dataExpiration.service_expiration) {
    throw new Error("Could not find service authorization");
  }

  return {
    authorization: decryptedAuthorization,
    expiration: dataExpiration.service_expiration,
  };
}

interface UpdateServiceAuthorization {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceAuthorization: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceExpiration: any;
  serviceId: string;
  supabaseAdmin: SupabaseClient;
  user: User;
}

async function updateServiceAuthorization({
  serviceAuthorization,
  serviceExpiration,
  serviceId,
  supabaseAdmin,
  user,
}: UpdateServiceAuthorization): Promise<void> {
  // Encrypt the service authorization before storing
  const encryptionKey = getEncryptionKey();
  const encryptedAuthorization =
    serviceAuthorization === null
      ? null
      : encryptServiceAuthorization(serviceAuthorization, encryptionKey);

  const { error: errorAuthorizations } = await supabaseAdmin
    .from("service_authorizations")
    .upsert(
      {
        service_authorization: encryptedAuthorization,
        service_id: serviceId,
        updated_at: new Date().toISOString(),
        user_id: user.id,
      },
      {
        onConflict: "user_id,service_id",
      },
    );

  if (errorAuthorizations) {
    throw new Error("Could not update service authorization");
  }

  const { error: errorServices } = await supabaseAdmin.from("services").upsert(
    {
      service_expiration: serviceExpiration,
      service_id: serviceId,
      updated_at: new Date().toISOString(),
      user_id: user.id,
    },
    {
      onConflict: "user_id,service_id",
    },
  );

  if (errorServices) {
    throw new Error("Could not update service data");
  }
}

interface UpdateServiceAccounts {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceAccounts: any;
  serviceId: string;
  supabaseAdmin: SupabaseClient;
  user: User;
}

async function updateServiceAccounts({
  serviceAccounts,
  serviceId,
  supabaseAdmin,
  user,
}: UpdateServiceAccounts): Promise<void> {
  const { error } = await supabaseAdmin.from("services").upsert(
    {
      service_accounts: serviceAccounts,
      service_id: serviceId,
      updated_at: new Date().toISOString(),
      user_id: user.id,
    },
    {
      onConflict: "user_id,service_id",
    },
  );

  if (error) {
    throw new Error("Could not update service accounts");
  }
}

interface UpdateServiceAuthorizationAndAccounts {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceAccounts: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceAuthorization: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceExpiration: any;
  serviceId: string;
  supabaseAdmin: SupabaseClient;
  user: User;
}

async function updateServiceAuthorizationAndAccounts({
  serviceAccounts,
  serviceAuthorization,
  serviceExpiration,
  serviceId,
  supabaseAdmin,
  user,
}: UpdateServiceAuthorizationAndAccounts): Promise<void> {
  // Encrypt the service authorization before storing
  const encryptionKey = getEncryptionKey();
  const encryptedAuthorization =
    serviceAuthorization === null
      ? null
      : encryptServiceAuthorization(serviceAuthorization, encryptionKey);

  const { error: errorAuthorization } = await supabaseAdmin
    .from("service_authorizations")
    .upsert(
      {
        service_authorization: encryptedAuthorization,
        service_id: serviceId,
        updated_at: new Date().toISOString(),
        user_id: user.id,
      },
      {
        onConflict: "user_id,service_id",
      },
    );

  if (errorAuthorization) {
    throw new Error("Could not update service authorization");
  }

  const { error: errorServices } = await supabaseAdmin.from("services").upsert(
    {
      service_accounts: serviceAccounts,
      service_expiration: serviceExpiration,
      service_id: serviceId,
      updated_at: new Date().toISOString(),
      user_id: user.id,
    },
    {
      onConflict: "user_id,service_id",
    },
  );

  if (errorServices) {
    throw new Error("Could not update service data");
  }
}

interface UpdateCodeVerifier {
  codeVerifier: string;
  serviceId: string;
  supabaseAdmin: SupabaseClient;
  user: User;
}

async function updateCodeVerifier({
  codeVerifier,
  serviceId,
  supabaseAdmin,
  user,
}: UpdateCodeVerifier): Promise<void> {
  // Store code verifier for later use
  const { error } = await supabaseAdmin.from("service_oauth_states").upsert(
    {
      // Expires in 10 minutes
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      key: `${serviceId}_code_verifier`,
      updated_at: new Date().toISOString(),
      user_id: user.id,
      value: { codeVerifier },
    },
    {
      // onConflict: "user_id,key",
    },
  );

  if (error) {
    throw new Error("Failed to store code verifier");
  }
}

export {
  getServiceAuthorizationAndExpiration,
  updateCodeVerifier,
  updateServiceAccounts,
  updateServiceAuthorization,
  updateServiceAuthorizationAndAccounts,
};
