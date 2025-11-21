import { NextResponse } from "next/server";

import { initServerAuth } from "@/lib/supabase/server-auth";

export async function GET() {
  try {
    const serverAuth = await initServerAuth();

    // Always return all services for the authenticated user
    const { data: servicesData, error: servicesError } =
      await serverAuth.supabaseAdmin
        .from("services")
        .select("*")
        .eq("user_id", serverAuth.user.id);

    if (servicesError) {
      throw new Error("Error loading services from Supabase:", servicesError);
    }

    return NextResponse.json(servicesData);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Post failed";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
