import { DEBUG_POST } from "@/config/constants";
import { sleep } from "@/lib/utils";
import type { CreatePostProps } from "@/services/post/types";

// 1GB
const VIDEO_MAX_FILESIZE = 1024 * 1024 * 1024 * 1;
// 3 seconds
const VIDEO_MIN_DURATION = 3;
// 10 minutes
const VIDEO_MAX_DURATION = 600;

interface UploadVideoProps {
  accessToken: string;
  mode: "hosted" | "self";
  text: string;
  title: string;
  videoUrl: string;
}
async function uploadVideo({
  accessToken,
  mode,
  text,
  title,
  videoUrl,
}: Readonly<UploadVideoProps>) {
  if (DEBUG_POST) {
    console.log("Test Tiktok: uploadVideo");
    await sleep(6000);
    return "test";
  }

  const endpoint =
    mode === "hosted"
      ? "https://open.tiktokapis.com/v2/post/publish/video/init/"
      : "/api/self/tiktok/v2/post/publish/video/init/";

  // Single API call with both video source and post data
  const response =
    accessToken === "hosted"
      ? await fetch(`/api/hosted/tiktok/video`, {
          body: JSON.stringify({
            text,
            title,
            videoUrl,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        })
      : await fetch(endpoint, {
          body: JSON.stringify({
            post_info: {
              description: text,
              disable_comment: false,
              disable_duet: false,
              disable_stitch: false,
              // TODO: tiktok can only post to private accounts in sandbox
              // privacy_level: "PUBLIC_TO_EVERYONE",
              privacy_level: "SELF_ONLY",
              title,
              video_cover_timestamp_ms: 1000,
            },
            source_info: {
              source: "PULL_FROM_URL",
              video_url: videoUrl,
            },
          }),
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json; charset=UTF-8",
          },
          method: "POST",
        });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Video publish failed: ${errorData?.details?.error?.code ?? 0} - ${errorData?.details?.error?.message ?? response.statusText}`,
    );
  }

  const result = await response.json();

  return result.data.publish_id;
}

async function createPost({
  accessToken,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  credentials,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requestUrl,
  setIsPosting,
  setPostError,
  setPostProgress,
  setPostStatus,
  text,
  title,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  video,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  videoHSLUrl,
  videoUrl,
}: Readonly<CreatePostProps>): Promise<string | null> {
  let progressInterval = null;

  try {
    if (DEBUG_POST) {
      // eslint-disable-next-line no-param-reassign
      videoUrl = "https://example.com/test-video.mp4";
    }

    setIsPosting(true);
    setPostError("");
    setPostProgress(0);
    setPostStatus("");

    setPostProgress(10);
    setPostStatus("Uploading post...");

    // Simulate progress updates during upload
    let progress = 10;
    progressInterval = setInterval(() => {
      progress = progress < 90 ? progress + 5 : progress;
      setPostProgress(progress);
    }, 2000);

    // Upload video directly to TikTok
    let postId = "";
    if (videoUrl) {
      postId = await uploadVideo({
        accessToken,
        mode: "self",
        text,
        title,
        videoUrl,
      });
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
  createPost,
  uploadVideo,
  VIDEO_MAX_DURATION,
  VIDEO_MAX_FILESIZE,
  VIDEO_MIN_DURATION,
};
