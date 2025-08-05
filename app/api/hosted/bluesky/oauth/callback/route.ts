// app/api/bluesky/oauth/callback/route.ts
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getAccountsFromAgent } from "@/services/post/bluesky/auth";
import {
  createAgent,
  handleCallback,
} from "@/services/post/bluesky/oauth-client-node";
import { SupabaseSessionStore } from "@/services/post/bluesky/store-session";
import { SupabaseStateStore } from "@/services/post/bluesky/store-state";

async function getUser(supabase: SupabaseClient): Promise<User> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const authorizeUrl = new URL(`${baseUrl}/authorize`);

  try {
    const supabase = await createClient();

    const user = await getUser(supabase);
    const stateStore = new SupabaseStateStore(supabase, user);
    const sessionStore = new SupabaseSessionStore(supabase, user);

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const iss = searchParams.get("iss");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle OAuth errors
    if (error) {
      console.error("OAuth callback error:", error, errorDescription);
      const errorUrl = authorizeUrl;
      errorUrl.searchParams.set("atproto_service", "bluesky");
      errorUrl.searchParams.set("error", error);
      if (errorDescription) {
        errorUrl.searchParams.set("error_description", errorDescription);
      }
      return redirect(errorUrl.toString());
    }

    if (!code || !iss || !state) {
      console.error("Missing OAuth callback parameters");
      const errorUrl = authorizeUrl;
      errorUrl.searchParams.set("atproto_service", "bluesky");
      errorUrl.searchParams.set("error", "missing_parameters");
      return redirect(errorUrl.toString());
    }

    console.log("Processing OAuth callback...");

    // Handle the callback using the node OAuth client
    const { session } = await handleCallback(
      searchParams,
      sessionStore,
      stateStore,
    );
    console.log("OAuth session created successfully:", session);

    console.log("OAuth session created successfully");

    const agent = await createAgent(sessionStore, stateStore, session.did);

    const accounts = await getAccountsFromAgent(agent, session.sub);

    const { error: supabaseError } = await supabase.from("services").upsert(
      {
        service_accounts: accounts,
        service_id: "bluesky",
        user_id: user.id,
      },
      {
        onConflict: "user_id,service_id",
      },
    );

    if (supabaseError) {
      throw new Error("Could not get accounts");
    }

    console.log("Tokens stored successfully");

    // Redirect back to the application
    const redirectUrl = authorizeUrl;
    redirectUrl.searchParams.set("atproto_service", "bluesky");
    redirectUrl.searchParams.set("auth", "success");

    return redirect(redirectUrl.toString());
  } catch (error: unknown) {
    console.error("OAuth callback error:", error);
    const errMessage = error instanceof Error ? error.message : "Unknown error";

    // Redirect to app with error
    const errorUrl = authorizeUrl;
    errorUrl.searchParams.set("atproto_service", "bluesky");
    errorUrl.searchParams.set("error", "callback_failed");
    errorUrl.searchParams.set("error_description", errMessage);

    return redirect(errorUrl.toString());
  }
}
