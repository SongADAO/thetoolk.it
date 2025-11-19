import { DEBUG_POST } from "@/config/constants";
import { sleep } from "@/lib/utils";
import type { PostServiceCreatePostProps } from "@/services/post/types";

// 1GB
const VIDEO_MAX_FILESIZE = 1024 * 1024 * 1024 * 1;
// 3 seconds
const VIDEO_MIN_DURATION = 3;
// 10 minutes
const VIDEO_MAX_DURATION = 600;

interface UploadVideoProps {
  accessToken: string;
  mode: "server" | "browser";
  options: {
    disclose?: boolean;
    discloseBrandOther?: boolean;
    discloseBrandSelf?: boolean;
    permissionComment?: boolean;
    permissionDuet?: boolean;
    permissionStitch?: boolean;
  };
  privacy: string;
  text: string;
  title: string;
  videoUrl: string;
}
async function uploadVideo({
  accessToken,
  mode,
  options,
  privacy,
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
    mode === "server"
      ? "https://open.tiktokapis.com/v2/post/publish/video/init/"
      : "/api/browser/tiktok/v2/post/publish/video/init/";

  // Single API call with both video source and post data
  const response =
    accessToken === "server"
      ? await fetch(`/api/hosted/tiktok/video`, {
          body: JSON.stringify({
            options,
            privacy,
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
              brand_content_toggle:
                options.disclose === true &&
                options.discloseBrandOther === true,
              brand_organic_toggle:
                options.disclose === true && options.discloseBrandSelf === true,
              description: text,
              disable_comment: options.permissionComment === false,
              disable_duet: options.permissionDuet === false,
              disable_stitch: options.permissionStitch === false,
              // is_aigc: false,
              privacy_level: privacy,
              title,
              // video_cover_timestamp_ms: 1000,
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
  options,
  privacy,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requestUrl,
  setIsProcessing,
  setProcessError,
  setProcessProgress,
  setProcessStatus,
  text,
  title,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  video,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  videoHSLUrl,
  videoUrl,
}: Readonly<PostServiceCreatePostProps>): Promise<string | null> {
  let progressInterval = null;

  try {
    if (DEBUG_POST) {
      // eslint-disable-next-line no-param-reassign
      videoUrl = "https://example.com/test-video.mp4";
    }

    setIsProcessing(true);
    setProcessError("");
    setProcessProgress(0);
    setProcessStatus("");

    setProcessProgress(10);
    setProcessStatus("Uploading post...");

    // Simulate progress updates during upload
    let progress = 10;
    progressInterval = setInterval(() => {
      progress = progress < 90 ? progress + 5 : progress;
      setProcessProgress(progress);
    }, 2000);

    // Upload video directly to TikTok
    let postId = "";
    if (videoUrl) {
      postId = await uploadVideo({
        accessToken,
        mode: "browser",
        options,
        privacy,
        text,
        title,
        videoUrl,
      });
    } else {
      // TODO: Text only post.
      throw new Error("Text only posts are not supported yet.");
    }

    setProcessProgress(100);
    setProcessStatus("Success");

    return postId;
  } catch (err: unknown) {
    console.error("Post error:", err);
    const errMessage = err instanceof Error ? err.message : "Post failed";
    setProcessError(`Post failed: ${errMessage}`);
    setProcessStatus("Post failed");
  } finally {
    setIsProcessing(false);
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
