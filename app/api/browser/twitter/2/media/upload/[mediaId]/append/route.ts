import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> },
) {
  try {
    const { mediaId } = await params;

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 },
      );
    }

    const response = await fetch(
      `https://api.x.com/2/media/upload/${mediaId}/append`,
      {
        body: await request.formData(),
        headers: {
          Authorization: authHeader,
        },
        method: "POST",
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Chunk upload failed: ${errorText}` },
        { status: response.status },
      );
    }

    // Twitter returns empty response for successful APPEND
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Append failed";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
