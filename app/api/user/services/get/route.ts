import { NextRequest, NextResponse } from "next/server";

import { initServerAuth } from "@/lib/supabase/server-auth";

export async function GET(request: NextRequest) {
  try {
    const serverAuth = await initServerAuth();

    const searchParams = request.nextUrl.searchParams;
    const serviceIds = searchParams.get("service_ids")?.split(",") ?? [];

    const { data: servicesData, error: servicesError } =
      await serverAuth.supabaseAdmin
        .from("services")
        .select("*")
        .eq("user_id", serverAuth.user.id)
        .in("service_id", serviceIds);

    if (servicesError) {
      throw new Error("Error loading services from Supabase:", servicesError);
    }

    return NextResponse.json(servicesData);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Post failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
