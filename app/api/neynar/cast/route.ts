// app/api/farcaster/cast/route.js
import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";
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

    const body = await request.json();

    // /* Build cast body */
    // const body: any = {
    //   // image / video / link embeds
    //   embeds: [],
    //   signer_uuid: signerUuid,
    //   text,
    // };

    // /* add video embed if provided */
    // if (videoUrl) {
    //   body.embeds.push({
    //     metadata: {
    //       thumbnailUrl,
    //     },
    //     mimeType: "video/mp4",
    //     // 'type' optional but explicit
    //     type: "video",
    //     url: videoUrl,
    //   });
    // }

    // if (channelId) body.channel_id = channelId;

    // if (replyTo) body.parent_hash = replyTo;

    // if (Array.isArray(mentions) && mentions.length) body.mentions = mentions;

    const client = new NeynarAPIClient(
      new Configuration({ apiKey: authHeader }),
    );

    const { cast } = await client.publishCast(body);

    return Response.json({ castHash: cast.hash, success: true });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Post failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
