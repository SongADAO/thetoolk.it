import type { SupabaseClient, User } from "@supabase/supabase-js";

async function getUser(supabase: SupabaseClient): Promise<User> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  // Then check MFA level
  const { data: mfaData } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (mfaData?.nextLevel === "aal2" && mfaData.currentLevel === "aal1") {
    throw new Error("2FA verification required");
  }

  return user;
}

export { getUser };
