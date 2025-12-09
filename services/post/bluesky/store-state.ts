import type {
  NodeSavedState,
  NodeSavedStateStore,
} from "@atproto/oauth-client-node";
import type { SupabaseClient, User } from "@supabase/supabase-js";

interface SupabaseStateStoreProps {
  supabaseAdmin: SupabaseClient;
  user: User;
}

class SupabaseStateStore implements NodeSavedStateStore {
  private readonly supabaseAdmin: SupabaseClient;

  private readonly user: User;

  public constructor({ supabaseAdmin, user }: SupabaseStateStoreProps) {
    this.supabaseAdmin = supabaseAdmin;
    this.user = user;
  }

  public async set(key: string, internalState: NodeSavedState): Promise<void> {
    const { error } = await this.supabaseAdmin
      .from("service_oauth_states")
      .upsert(
        {
          // 10 minutes
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          key,
          updated_at: new Date().toISOString(),
          user_id: this.user.id,
          value: internalState,
        },
        {
          onConflict: "key",
        },
      );

    if (error) {
      throw new Error(`Failed to store OAuth state: ${error.message}`);
    }
  }

  public async get(key: string): Promise<NodeSavedState | undefined> {
    const { data, error } = await this.supabaseAdmin
      .from("service_oauth_states")
      .select("value, expires_at")
      .eq("key", key)
      .eq("user_id", this.user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return undefined;
      }
      throw new Error(`Failed to get OAuth state: ${error.message}`);
    }

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      await this.del(key);
      return undefined;
    }

    return data.value;
  }

  public async del(key: string): Promise<void> {
    const { error } = await this.supabaseAdmin
      .from("service_oauth_states")
      .delete()
      .eq("key", key)
      .eq("user_id", this.user.id);

    if (error) {
      throw new Error(`Failed to delete OAuth state: ${error.message}`);
    }
  }
}

export { SupabaseStateStore };
