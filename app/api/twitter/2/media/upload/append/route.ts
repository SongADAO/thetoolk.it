import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return Response.json(
        { error: "Authorization header required" },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const mediaId = String(formData.get("mediaId") ?? "");

    // Remove mediaId from formData as it goes in the URL
    formData.delete("mediaId");

    const response = await fetch(
      `https://api.x.com/2/media/upload/${mediaId}/append`,
      {
        body: formData,
        headers: {
          Authorization: authHeader,
        },
        method: "POST",
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json(
        { error: `Chunk upload failed: ${errorText}` },
        { status: response.status },
      );
    }

    // Twitter returns empty response for successful APPEND
    return Response.json({ success: true });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Append failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
