import type { SupabaseClient, User } from "@supabase/supabase-js";

interface LogServerPostProps {
  postData: object;
  serviceId: string;
  statusId: number;
  supabaseAdmin: SupabaseClient;
  user: User;
}

async function logServerPost({
  postData,
  serviceId,
  statusId,
  supabaseAdmin,
  user,
}: LogServerPostProps): Promise<void> {
  try {
    const { error: errorLog } = await supabaseAdmin.from("posts").insert(
      {
        post_data: postData,
        service_id: serviceId,
        status_id: statusId,
        user_id: user.id,
      },
      {},
    );

    if (errorLog) {
      throw new Error(`Could not log post: ${errorLog.message}`);
    }
  } catch (error: unknown) {
    // Allow failure
    console.error("Failed to log post:", error);
  }
}

interface LogClientEventProps {
  eventData: object;
  eventType: string;
  ipAddress: string;
  serviceId: string;
  supabaseAdmin: SupabaseClient;
}

async function logClientEvent({
  eventData,
  eventType,
  ipAddress,
  serviceId,
  supabaseAdmin,
}: LogClientEventProps): Promise<void> {
  try {
    const { error: errorLog } = await supabaseAdmin
      .from("client_event_logs")
      .insert(
        {
          event_data: eventData,
          event_type: eventType,
          ip_address: ipAddress,
          service_id: serviceId,
        },
        {},
      );

    if (errorLog) {
      throw new Error(`Could not log client event: ${errorLog.message}`);
    }
  } catch (error: unknown) {
    // Allow failure
    console.error("Failed to log client event:", error);
  }
}

export { logClientEvent, logServerPost };
