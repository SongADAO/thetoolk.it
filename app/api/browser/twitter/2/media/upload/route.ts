import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 },
      );
    }

    const response = await fetch(
      `https://api.x.com/2/media/upload?${request.nextUrl.searchParams.toString()}`,
      {
        headers: {
          Authorization: authHeader,
        },
        method: "GET",
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Status check failed: ${errorText}` },
        { status: response.status },
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Status failed";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
