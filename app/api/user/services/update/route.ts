import { NextRequest, NextResponse } from "next/server";

import { initServerAuth } from "@/lib/supabase/server-auth";

export async function POST(request: NextRequest) {
  try {
    const serverAuth = await initServerAuth();

    const { serviceField, value, serviceId } = await request.json();

    const { error } = await serverAuth.supabaseAdmin.from("services").upsert(
      {
        [serviceField]: value,
        service_id: serviceId,
        user_id: serverAuth.user.id,
      },
      { onConflict: "user_id,service_id" },
    );

    if (error) {
      throw new Error("Error saving services to Supabase:", error);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Post failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
