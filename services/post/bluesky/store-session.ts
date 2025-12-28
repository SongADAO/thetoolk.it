import type {
  NodeSavedSession,
  NodeSavedSessionStore,
} from "@atproto/oauth-client-node";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import {
  getServiceAuthorizationAndExpiration,
  updateServiceAuthorization,
} from "@/lib/supabase/service";
import { formatServerExpiration } from "@/services/post/bluesky/auth";
// import { defaultOauthExpiration } from "@/services/post/types";

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
    const serviceAuthorization = { ...session, key };

    const serviceExpiration = formatServerExpiration();

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
    // await updateServiceAuthorization({
    //   serviceAuthorization: null,
    //   serviceExpiration: defaultOauthExpiration,
    //   serviceId: "bluesky",
    //   supabaseAdmin: this.supabaseAdmin,
    //   user: this.user,
    // });
  }
}

export { SupabaseSessionStore };
