import { DEBUG_POST } from "@/config/constants";
import { sleep } from "@/lib/utils";
import type { OauthCredentials } from "@/services/post/types";

let DEBUG_STATUS_STEP = 0;

// 1GB
const VIDEO_MAX_FILESIZE = 1024 * 1024 * 1024 * 1;
// 3 seconds
const VIDEO_MIN_DURATION = 3;
// 5 minutes
// const VIDEO_MAX_DURATION = 300;
// 4 minutes
const VIDEO_MAX_DURATION = 240;

// Create Threads media container
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
    console.log("Test Threads: createMediaContainer");
    await sleep(1000);
    return "test";
  }

  console.log("Creating Threads media container");

  const response =
    accessToken === "hosted"
      ? await fetch(`/api/hosted/threads/media`, {
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
      : await fetch(`https://graph.threads.net/v1.0/${userId}/threads`, {
          body: new URLSearchParams({
            access_token: accessToken,
            media_type: "VIDEO",
            text,
            // reply_control: replyControl,
            video_url: videoUrl,
          }),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: "POST",
        });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Threads create media container error response:", errorData);

    const errorCode = errorData.error?.code;
    const errorMessage = errorData.error?.message ?? "Unknown error";

    if (errorCode === 190) {
      throw new Error(
        "Access token expired or invalid. Please re-authorize Threads access.",
      );
    }

    if (
      errorMessage.includes("video file") ||
      errorMessage.includes("format")
    ) {
      throw new Error(
        `Video format issue: ${errorMessage}. Make sure your video is MP4/MOV with proper encoding.`,
      );
    }

    throw new Error(`Threads API Error (${errorCode}): ${errorMessage}`);
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
    console.log("Test Threads: checkMediaStatus");
    // await sleep(1000);

    return DEBUG_STATUS_STEP === 4 ? "FINISHED" : "IN_PROGRESS";
  }

  const params = new URLSearchParams({
    access_token: accessToken,
    fields: "status",
  });

  const response =
    accessToken === "hosted"
      ? await fetch(`/api/hosted/threads/media_status`, {
          body: JSON.stringify({
            creationId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        })
      : await fetch(
          `https://graph.threads.net/v1.0/${creationId}?${params.toString()}`,
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

  return result.status;
}

// Publish media to Threads
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
    console.log("Test Threads: publishMedia");
    await sleep(1000);

    return "test";
  }

  const response =
    accessToken === "hosted"
      ? await fetch(`/api/hosted/threads/media_publish`, {
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
          `https://graph.threads.net/v1.0/${userId}/threads_publish`,
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
    console.error("Threads publish error response:", errorData);

    const errorCode = errorData.error?.code;
    const errorMessage = errorData.error?.message ?? "Unknown error";

    if (errorCode === 190) {
      throw new Error(
        "Access token expired. Please re-authorize Threads access.",
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  userId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  video,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  videoHSLUrl,
  videoUrl,
}: Readonly<CreatePostProps>): Promise<string | null> {
  try {
    if (DEBUG_POST) {
      // eslint-disable-next-line no-param-reassign
      videoUrl = "https://example.com/test-video.mp4";
    }

    setIsPosting(true);
    setPostError("");
    setPostProgress(0);
    setPostStatus("");

    let postId = "";
    if (videoUrl) {
      setPostProgress(10);
      setPostStatus("Creating media container...");

      // Step 2: Create media container (30-50% progress)
      const creationId = await createMediaContainer({
        accessToken,
        text,
        userId,
        videoUrl,
      });

      setPostProgress(20);
      setPostStatus("Preparing post...");

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
        setPostProgress(Math.round(progress));
        setPostStatus(`Submitting post... (${attempts}/${maxAttempts})`);

        console.log(`Attempt ${attempts}: Status = ${status}`);
      }

      if (status === "ERROR") {
        throw new Error(
          "Threads rejected the video. Please check that your video meets all format requirements.",
        );
      }

      if (status === "IN_PROGRESS") {
        throw new Error(
          "Video processing timed out. This may indicate the video file doesn't meet Threads' requirements.",
        );
      }

      if (status !== "FINISHED") {
        throw new Error(`Video processing failed with status: ${status}`);
      }

      setPostProgress(90);
      setPostStatus("Publishing post...");

      // Step 4: Publish the media (80-100% progress)
      postId = await publishMedia({ accessToken, creationId, userId });
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
