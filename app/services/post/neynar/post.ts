import { DEBUG_MODE } from "@/app/config/constants";
import { sleep } from "@/app/lib/utils";
import type { OauthCredentials } from "@/app/services/post/types";

interface CreateCastProps {
  clientSecret: string;
  text: string;
  userId: string;
  videoPlaylistUrl: string;
  videoThumbnailUrl: string;
}
async function createCast({
  clientSecret,
  text,
  userId,
  videoPlaylistUrl,
  videoThumbnailUrl,
}: Readonly<CreateCastProps>): Promise<string> {
  if (DEBUG_MODE) {
    console.log("Test Neynar: createCast");
    await sleep(1000);
    return "test";
  }

  const params = {
    // channel_id: undefined,
    embeds: [
      {
        metadata: {
          videoThumbnailUrl,
        },
        mimeType: "video/mp4",
        type: "video",
        url: videoPlaylistUrl,
      },
    ],
    // mentions: [],
    // parent_hash: undefined,
    signer_uuid: userId,
    text,
  };

  const response = await fetch("https://api.neynar.com/v2/farcaster/cast", {
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json",
      "x-api-key": clientSecret,
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to create post: ${errorData.message ?? response.statusText}`,
    );
  }

  const result = await response.json();

  return result.cast.hash;
}

// Create a post
interface CreatePostProps {
  credentials: OauthCredentials;
  setIsPosting: (isPosting: boolean) => void;
  setPostError: (error: string) => void;
  setPostProgress: (progress: number) => void;
  setPostStatus: (status: string) => void;
  title: string;
  text: string;
  userId: string;
  videoThumbnailUrl: string;
  videoPlaylistUrl: string;
}
async function createPost({
  credentials,
  setIsPosting,
  setPostError,
  setPostProgress,
  setPostStatus,
  text,
  userId,
  videoThumbnailUrl,
  videoPlaylistUrl,
}: Readonly<CreatePostProps>): Promise<string | null> {
  try {
    setIsPosting(true);
    setPostError("");
    setPostProgress(0);
    setPostStatus("");

    let postId = "";
    if (videoPlaylistUrl) {
      setPostStatus("Publishing cast …");
      postId = await createCast({
        clientSecret: credentials.clientSecret,
        text,
        userId,
        videoPlaylistUrl,
        videoThumbnailUrl,
      });
    } else {
      // TODO: Text only post.
    }

    setPostProgress(100);
    setPostStatus("Success");

    return postId;
  } catch (err: unknown) {
    console.error("Post error:", err);
    const errMessage = err instanceof Error ? err.message : "Post failed";
    setPostError(`Post failed: ${errMessage}`);
    setPostStatus("Post failed");
  } finally {
    setIsPosting(false);
  }

  return null;
}

export { createPost };
