import type {
  NodeSavedSession,
  NodeSavedSessionStore,
} from "@atproto/oauth-client-node";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import {
  getServiceAuthorizationAndExpiration,
  updateServiceAuthorization,
} from "@/lib/supabase/service";

interface SupabaseSessionStoreProps {
  supabaseAdmin: SupabaseClient;
  user: User;
}

class SupabaseSessionStore implements NodeSavedSessionStore {
  private readonly supabaseAdmin: SupabaseClient;

  private readonly user: User;

  public constructor({ supabaseAdmin, user }: SupabaseSessionStoreProps) {
    this.supabaseAdmin = supabaseAdmin;
    this.user = user;
  }

  public async set(key: string, session: NodeSavedSession): Promise<void> {
    const now = new Date();
    const accessTokenExpiresAt = new Date(
      now.getTime() + 7 * 24 * 60 * 60 * 1000,
    );
    const refreshTokenExpiresAt = new Date(
      now.getTime() + 7 * 24 * 60 * 60 * 1000,
    );

    const serviceAuthorization = { ...session, key };

    const serviceExpiration = { accessTokenExpiresAt, refreshTokenExpiresAt };

    await updateServiceAuthorization({
      serviceAuthorization,
      serviceExpiration,
      serviceId: "bluesky",
      supabaseAdmin: this.supabaseAdmin,
      user: this.user,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async get(key: string): Promise<NodeSavedSession | undefined> {
    const authorization = await getServiceAuthorizationAndExpiration({
      serviceId: "bluesky",
      supabaseAdmin: this.supabaseAdmin,
      user: this.user,
    });

    return authorization.authorization;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/class-methods-use-this, @typescript-eslint/require-await
  public async del(key: string): Promise<void> {
    // const { error } = await this.supabaseAdmin
    //   .from("services")
    //   .delete()
    //   // .eq("key", key)
    //   .eq("service_id", "bluesky")
    //   .eq("user_id", this.user.id);
    // if (error) {
    //   throw new Error(`Failed to delete OAuth session: ${error.message}`);
    // }
    throw new Error(`Bluesky tried to delete a session`);
  }
}

export { SupabaseSessionStore };
