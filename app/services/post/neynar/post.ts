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

  const response = await fetch("/api/neynar/cast", {
    body: JSON.stringify(params),
    headers: {
      Authorization: clientSecret,
      "Content-Type": "application/json",
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
    setPostStatus(`✅ Successfully posted to Farcaster! Post ID: ${postId}`);

    return postId;
  } catch (err: unknown) {
    console.error("Post error:", err);

    const errMessage = err instanceof Error ? err.message : "Post failed";
    setPostError(`Post failed: ${errMessage}`);
    setPostStatus("❌ Post failed");
  } finally {
    setIsPosting(false);
  }

  return null;
}

export { createPost };
