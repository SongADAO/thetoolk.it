import { NextRequest, NextResponse } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { updateServiceAccounts } from "@/lib/supabase/service";
import { getAccountsFromAgent } from "@/services/post/bluesky/auth";
import {
  createAgent,
  handleCallback,
} from "@/services/post/bluesky/oauth-client-node";
import { SupabaseSessionStore } from "@/services/post/bluesky/store-session";
import { SupabaseStateStore } from "@/services/post/bluesky/store-state";
import { getOauthUrls } from "@/services/post/hosted";

export async function GET(request: NextRequest) {
  const serviceId = "bluesky";
  const oauthUrls = getOauthUrls();

  try {
    const serverAuth = await initServerAuth();
    const stateStore = new SupabaseStateStore({ ...serverAuth });
    const sessionStore = new SupabaseSessionStore({ ...serverAuth });

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const iss = searchParams.get("iss");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle OAuth errors
    if (error) {
      console.error("OAuth callback error:", error, errorDescription);
      oauthUrls.error.searchParams.set("service", "bluesky");
      oauthUrls.error.searchParams.set("error", error);
      if (errorDescription) {
        oauthUrls.error.searchParams.set("error_description", errorDescription);
      }

      return NextResponse.redirect(oauthUrls.error.toString());
    }

    if (!code || !iss || !state) {
      console.error("Missing OAuth callback parameters");
      oauthUrls.error.searchParams.set("service", "bluesky");
      oauthUrls.error.searchParams.set("error", "missing_parameters");

      return NextResponse.redirect(oauthUrls.error.toString());
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

    const agent = await createAgent(sessionStore, stateStore, session.sub);

    const accounts = await getAccountsFromAgent(agent, session.sub);

    await updateServiceAccounts({
      ...serverAuth,
      serviceAccounts: accounts,
      serviceId,
    });

    console.log("Tokens stored successfully");

    // Redirect back to the application
    oauthUrls.success.searchParams.set("service", serviceId);
    oauthUrls.success.searchParams.set("auth", "success");

    return NextResponse.redirect(oauthUrls.success.toString());
  } catch (error: unknown) {
    console.error("OAuth callback error:", error);
    const errMessage = error instanceof Error ? error.message : "Unknown error";

    // Redirect to app with error
    oauthUrls.error.searchParams.set("service", serviceId);
    oauthUrls.error.searchParams.set("error", "callback_failed");
    oauthUrls.error.searchParams.set("error_description", errMessage);

    return NextResponse.redirect(oauthUrls.error.toString());
  }
}
