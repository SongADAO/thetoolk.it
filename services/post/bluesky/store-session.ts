import type {
  NodeSavedSession,
  NodeSavedSessionStore,
} from "@atproto/oauth-client-node";
import type { SupabaseClient, User } from "@supabase/supabase-js";

class SupabaseSessionStore implements NodeSavedSessionStore {
  private readonly supabase: SupabaseClient;

  private readonly user: User;

  public constructor(supabase: SupabaseClient, user: User) {
    this.supabase = supabase;
    this.user = user;
  }

  public async set(key: string, session: NodeSavedSession): Promise<void> {
    const now = new Date();
    const refreshTokenExpiresAt = new Date(
      now.getTime() + 7 * 24 * 60 * 60 * 1000,
    );

    const savedSession = { ...session, key, refreshTokenExpiresAt };

    const { error } = await this.supabase.from("services").upsert(
      {
        service_authorization: savedSession,
        service_id: "bluesky",
        user_id: this.user.id,
      },
      {
        onConflict: "user_id,service_id",
      },
    );

    if (error) {
      throw new Error(`Failed to store OAuth session: ${error.message}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async get(key: string): Promise<NodeSavedSession | undefined> {
    const { data, error } = await this.supabase
      .from("services")
      .select("service_authorization")
      // .eq("key", key)
      .eq("service_id", "bluesky")
      .eq("user_id", this.user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return undefined;
      }
      throw new Error(`Failed to get OAuth session: ${error.message}`);
    }

    // Check if expired
    // if (new Date(data.expires_at) < new Date()) {
    //   await this.del(key);
    //   return undefined;
    // }
    console.log(data.service_authorization);

    return data.service_authorization;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async del(key: string): Promise<void> {
    const { error } = await this.supabase
      .from("services")
      .delete()
      // .eq("key", key)
      .eq("service_id", "bluesky")
      .eq("user_id", this.user.id);

    if (error) {
      throw new Error(`Failed to delete OAuth session: ${error.message}`);
    }
  }
}

export { SupabaseSessionStore };
