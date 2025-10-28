import { DEBUG_POST } from "@/config/constants";
import { sleep } from "@/lib/utils";
import type { OauthCredentials } from "@/services/post/types";

// 100GB
const VIDEO_MAX_FILESIZE = 1024 * 1024 * 1024 * 100;
// 3 seconds
const VIDEO_MIN_DURATION = 3;
// 100 days
const VIDEO_MAX_DURATION = 60 * 24 * 100;

interface CreateCastProps {
  accessToken: string;
  clientSecret: string;
  text: string;
  videoHSLUrl: string;
}
async function createCast({
  accessToken,
  clientSecret,
  text,
  videoHSLUrl,
}: Readonly<CreateCastProps>): Promise<string> {
  if (DEBUG_POST) {
    console.log("Test Neynar: createCast");
    await sleep(1000);
    return "test";
  }

  const response =
    accessToken === "hosted"
      ? await fetch("/api/hosted/neynar/cast", {
          body: JSON.stringify({
            text,
            videoHSLUrl,
          }),
          headers: {
            "Content-Type": "application/json",
            "x-api-key": clientSecret,
          },
          method: "POST",
        })
      : await fetch("https://api.neynar.com/v2/farcaster/cast", {
          body: JSON.stringify({
            // channel_id: undefined,
            embeds: [
              {
                mimeType: "video/mp4",
                type: "video",
                url: videoHSLUrl,
              },
            ],
            // mentions: [],
            // parent_hash: undefined,
            signer_uuid: accessToken,
            text,
          }),
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
  accessToken: string;
  credentials: OauthCredentials;
  requestUrl: string;
  setIsPosting: (isPosting: boolean) => void;
  setPostError: (error: string) => void;
  setPostProgress: (progress: number) => void;
  setPostStatus: (status: string) => void;
  text: string;
  title: string;
  userId: string;
  video: File | null;
  videoHSLUrl: string;
  videoUrl: string;
}
async function createPost({
  accessToken,
  credentials,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requestUrl,
  setIsPosting,
  setPostError,
  setPostProgress,
  setPostStatus,
  text,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  video,
  videoHSLUrl,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  videoUrl,
}: Readonly<CreatePostProps>): Promise<string | null> {
  let progressInterval = null;

  try {
    if (DEBUG_POST) {
      // eslint-disable-next-line no-param-reassign
      videoHSLUrl = "https://example.com/test-video.mp4";
    }

    setIsPosting(true);
    setPostError("");
    setPostProgress(0);
    setPostStatus("");

    let postId = "";
    if (videoHSLUrl) {
      setPostStatus("Publishing post...");

      // Simulate progress during upload
      let progress = 10;
      progressInterval = setInterval(() => {
        progress = progress < 90 ? progress + 5 : progress;
        setPostProgress(progress);
      }, 2000);

      postId = await createCast({
        accessToken,
        clientSecret:
          accessToken === "hosted" ? "hosted" : credentials.clientSecret,
        text,
        videoHSLUrl,
      });

      clearInterval(progressInterval);
    } else {
      // TODO: Text only post.
      throw new Error("Text only posts are not supported yet.");
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
    // Clear progress interval
    if (progressInterval) {
      clearInterval(progressInterval);
    }
  }

  return null;
}

export {
  createCast,
  createPost,
  VIDEO_MAX_DURATION,
  VIDEO_MAX_FILESIZE,
  VIDEO_MIN_DURATION,
};
