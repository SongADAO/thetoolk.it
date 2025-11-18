import { DEBUG_POST } from "@/config/constants";
import { sleep } from "@/lib/utils";
import type { PostServiceCreatePostProps } from "@/services/post/types";

let DEBUG_STATUS_STEP = 0;

// 300MB
const VIDEO_MAX_FILESIZE = 1024 * 1024 * 300;
// 3 seconds
const VIDEO_MIN_DURATION = 3;
// // 15 minutes
// const VIDEO_MAX_DURATION = 900;
// 4 minutes
const VIDEO_MAX_DURATION = 240;

// Create Instagram media container
interface CreateMediaContainerProps {
  accessToken: string;
  text: string;
  userId: string;
  videoUrl: string;
}
async function createMediaContainer({
  accessToken,
  text,
  userId,
  videoUrl,
}: Readonly<CreateMediaContainerProps>): Promise<string> {
  if (DEBUG_POST) {
    console.log("Test Instagram: uploadVideo");
    await sleep(1000);
    return "test";
  }

  console.log("Creating Instagram media container");

  const response =
    accessToken === "hosted"
      ? await fetch(`/api/hosted/instagram/media`, {
          body: JSON.stringify({
            text,
            userId,
            videoUrl,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        })
      : await fetch(`https://graph.instagram.com/v23.0/${userId}/media`, {
          body: new URLSearchParams({
            access_token: accessToken,
            caption: text,
            media_type: "REELS",
            video_url: videoUrl,
          }),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: "POST",
        });

  if (!response.ok) {
    const errorData = await response.json();
    console.error(
      "Instagram create media container error response:",
      errorData,
    );

    const errorCode = errorData.error?.code;
    const errorMessage = errorData.error?.message ?? "Unknown error";

    if (
      errorMessage.includes("video file") ||
      errorMessage.includes("format")
    ) {
      throw new Error(
        `Video format issue: ${errorMessage}. Make sure your video is MP4/MOV with H.264 codec, max 100MB, and proper aspect ratio.`,
      );
    }

    if (errorMessage.includes("Invalid parameter")) {
      throw new Error(
        `Invalid parameter: ${errorMessage}. Check that your Instagram account is a Business/Creator account and properly linked to a Facebook page.`,
      );
    }

    if (errorCode === 190) {
      throw new Error(
        "Access token expired or invalid. Please re-authorize Instagram access.",
      );
    }

    if (errorCode === 200) {
      throw new Error(
        "Instagram permissions error. Make sure your app has instagram_content_publish permission.",
      );
    }

    throw new Error(`Instagram API Error (${errorCode}): ${errorMessage}`);
  }

  const result = await response.json();
  console.log("Media container created successfully:", result);

  return result.id;
}

// Check media container status
interface CheckMediaStatusProps {
  accessToken: string;
  creationId: string;
}
async function checkMediaStatus({
  accessToken,
  creationId,
}: Readonly<CheckMediaStatusProps>): Promise<string> {
  if (DEBUG_POST) {
    if (DEBUG_STATUS_STEP === 4) {
      DEBUG_STATUS_STEP = 0;
    }
    DEBUG_STATUS_STEP++;
    console.log("Test Instagram: checkMediaStatus");
    // await sleep(1000);

    return DEBUG_STATUS_STEP === 4 ? "FINISHED" : "IN_PROGRESS";
  }

  const params = new URLSearchParams({
    access_token: accessToken,
    fields: "status_code",
  });

  const response =
    accessToken === "hosted"
      ? await fetch(`/api/hosted/instagram/media_status`, {
          body: JSON.stringify({
            creationId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        })
      : await fetch(
          `https://graph.instagram.com/v23.0/${creationId}?${params.toString()}`,
        );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Status check error:", errorText);

    throw new Error(
      `Failed to check media status: HTTP ${response.status} - ${errorText}`,
    );
  }

  const result = await response.json();
  console.log("Media status check:", result);

  return result.status_code;
}

// Publish media to Instagram
interface PublishMediaProps {
  accessToken: string;
  creationId: string;
  userId: string;
}
async function publishMedia({
  accessToken,
  creationId,
  userId,
}: Readonly<PublishMediaProps>) {
  if (DEBUG_POST) {
    console.log("Test Instagram: publishMedia");
    await sleep(1000);

    return "test";
  }

  const response =
    accessToken === "hosted"
      ? await fetch(`/api/hosted/instagram/media_publish`, {
          body: JSON.stringify({
            creationId,
            userId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        })
      : await fetch(
          `https://graph.instagram.com/v23.0/${userId}/media_publish`,
          {
            body: new URLSearchParams({
              access_token: accessToken,
              creation_id: creationId,
            }),
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
          },
        );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Instagram publish error response:", errorData);

    const errorCode = errorData.error?.code;
    const errorMessage = errorData.error?.message ?? "Unknown error";

    if (errorCode === 190) {
      throw new Error(
        "Access token expired. Please re-authorize Instagram access.",
      );
    }

    if (errorMessage.includes("not available")) {
      throw new Error(
        "Media container is not ready for publishing. Please wait longer for processing to complete.",
      );
    }

    throw new Error(`Publish Error (${errorCode}): ${errorMessage}`);
  }

  const result = await response.json();
  console.log("Media published successfully:", result);

  return result.id;
}

async function createPost({
  accessToken,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  credentials,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  privacy,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requestUrl,
  setIsProcessing,
  setProcessError,
  setProcessProgress,
  setProcessStatus,
  text,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title,
  userId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  video,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  videoHSLUrl,
  videoUrl,
}: Readonly<PostServiceCreatePostProps>): Promise<string | null> {
  try {
    if (DEBUG_POST) {
      // eslint-disable-next-line no-param-reassign
      videoUrl = "https://example.com/test-video.mp4";
    }

    setIsProcessing(true);
    setProcessError("");
    setProcessProgress(0);
    setProcessStatus("");

    let postId = "";
    if (videoUrl) {
      setProcessProgress(10);
      setProcessStatus("Creating media container...");

      // Step 2: Create media container (30-50% progress)
      const creationId = await createMediaContainer({
        accessToken,
        text,
        userId,
        videoUrl,
      });

      setProcessProgress(20);
      setProcessStatus("Preparing post...");

      // Step 3: Wait for processing (50-80% progress)
      let status = "IN_PROGRESS";
      let attempts = 0;
      // retry every 5 seconds
      const retryDelay = 5 * 1000;
      // 5 minutes max
      const maxAttempts = 60;

      while (status === "IN_PROGRESS" && attempts < maxAttempts) {
        // Wait for retry delay.
        // eslint-disable-next-line no-await-in-loop -- Intentional polling pattern
        await sleep(retryDelay);

        // eslint-disable-next-line no-await-in-loop -- Intentional polling pattern
        status = await checkMediaStatus({ accessToken, creationId });
        attempts++;

        const progress = 20 + (attempts / maxAttempts) * 30;
        setProcessProgress(Math.round(progress));
        setProcessStatus(`Uploading post... (${attempts}/${maxAttempts})`);

        console.log(`Attempt ${attempts}: Status = ${status}`);
      }

      if (status === "ERROR") {
        throw new Error(
          "Instagram rejected the video. Please check that your video meets all format requirements.",
        );
      }

      if (status === "IN_PROGRESS") {
        throw new Error(
          "Video processing timed out. This may indicate the video file doesn't meet Instagram' requirements.",
        );
      }

      if (status !== "FINISHED") {
        throw new Error(`Video processing failed with status: ${status}`);
      }

      setProcessProgress(90);
      setProcessStatus("Publishing post...");

      // Step 4: Publish the media (80-100% progress)
      postId = await publishMedia({ accessToken, creationId, userId });
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
  }

  return null;
}

export {
  checkMediaStatus,
  createMediaContainer,
  createPost,
  publishMedia,
  VIDEO_MAX_DURATION,
  VIDEO_MAX_FILESIZE,
  VIDEO_MIN_DURATION,
};
