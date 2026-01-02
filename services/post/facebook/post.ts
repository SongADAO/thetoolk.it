import { DEBUG_POST } from "@/config/constants";
import { sleep } from "@/lib/utils";
import { getAccountAccessToken } from "@/services/post/facebook/auth";
import type { PostServiceCreatePostProps } from "@/services/post/types";

// 4GB
const VIDEO_MAX_FILESIZE = 1024 * 1024 * 1024 * 4;
// 3 seconds
const VIDEO_MIN_DURATION = 3;
// // 15 minutes
// const VIDEO_MAX_DURATION = 900;
// 4 minutes
const VIDEO_MAX_DURATION = 240;

const TITLE_MAX_LENGTH = 255;

const TEXT_MAX_LENGTH = 500;

interface UploadVideoProps {
  accessToken: string;
  privacy: string;
  text: string;
  title: string;
  userId: string;
  videoUrl: string;
}

async function uploadVideo({
  accessToken,
  privacy,
  text,
  title,
  userId,
  videoUrl,
}: Readonly<UploadVideoProps>) {
  if (DEBUG_POST) {
    console.log("Test Facebook: uploadVideo");
    await sleep(6000);
    return "test";
  }

  const response =
    accessToken === "server"
      ? await fetch(`/api/hosted/facebook/videos`, {
          body: JSON.stringify({
            privacy,
            text,
            title,
            userId,
            videoUrl,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        })
      : await fetch(`https://graph-video.facebook.com/v23.0/${userId}/videos`, {
          body: new URLSearchParams({
            access_token: await getAccountAccessToken(accessToken, userId),
            description: text,
            file_url: videoUrl,
            // privacy: JSON.stringify({ value: privacy }),
            title,
          }),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: "POST",
        });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Facebook upload error response:", errorData);

    const errorCode = errorData.error?.code;
    const errorMessage = errorData.error?.message ?? "Unknown error";

    if (
      errorMessage.includes("video file") ||
      errorMessage.includes("format")
    ) {
      throw new Error(
        `Video format issue: ${errorMessage}. Make sure your video URL is accessible and in a supported format.`,
      );
    }

    if (errorCode === 190) {
      throw new Error(
        "Access token expired or invalid. Please re-authorize Facebook access.",
      );
    }

    if (errorCode === 200) {
      throw new Error(
        "Facebook permissions error. Make sure your app has the required permissions.",
      );
    }

    throw new Error(`Facebook API Error (${errorCode}): ${errorMessage}`);
  }

  const result = await response.json();
  console.log("Video uploaded successfully:", result);

  return result.id;
}

async function createPost({
  accessToken,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  credentials,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // Upload video directly to Facebook using URL
    let postId = "";
    if (videoUrl) {
      setProcessProgress(10);
      setProcessStatus("Publishing post...");

      // Simulate progress updates during upload
      let progress = 10;
      progressInterval = setInterval(() => {
        progress = progress < 90 ? progress + 5 : progress;
        setProcessProgress(progress);
      }, 2000);

      postId = await uploadVideo({
        accessToken,
        privacy,
        text,
        title,
        userId,
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
  TEXT_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  uploadVideo,
  VIDEO_MAX_DURATION,
  VIDEO_MAX_FILESIZE,
  VIDEO_MIN_DURATION,
};
