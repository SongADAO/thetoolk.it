import { DEBUG_POST } from "@/config/constants";
import { sleep } from "@/lib/utils";
import type { PostServiceCreatePostProps } from "@/services/post/types";

let DEBUG_STATUS_STEP = 0;

// 512MB
const VIDEO_MAX_FILESIZE = 1024 * 1024 * 512;
// 3 seconds
const VIDEO_MIN_DURATION = 3;
// 2 minutes and 20 seconds
const VIDEO_MAX_DURATION = 140;

interface TwitterFinalizeUploadResponse {
  data?: {
    media_id?: string;
    media_key?: string;
    processing_info?: {
      check_after_secs?: number;
      error?: {
        code?: number;
        message?: string;
        name?: string;
      };
      state?: string;
    };
  };
}

interface TwitterStatusUploadResponse {
  data?: {
    processing_info?: {
      check_after_secs?: number;
      error?: {
        code?: number;
        message?: string;
        name?: string;
      };
      progress_percent?: number;
      state?: string;
    };
  };
}

interface InitializeUploadVideoProps {
  accessToken: string;
  mode: "server" | "browser";
  videoSize: number;
  videoType: string;
}
async function initializeUploadVideo({
  accessToken,
  mode,
  videoSize,
  videoType,
}: Readonly<InitializeUploadVideoProps>): Promise<string> {
  if (DEBUG_POST) {
    console.log("Test Twitter: initializeUploadVideo");
    await sleep(1000);
    return "test";
  }

  const endpoint =
    mode === "server"
      ? "https://api.x.com/2/media/upload/initialize"
      : "/api/browser/twitter/2/media/upload/initialize";

  const response =
    accessToken === "server"
      ? await fetch(`/api/hosted/twitter/media/initialize`, {
          body: JSON.stringify({
            videoSize,
            videoType,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        })
      : await fetch(endpoint, {
          body: JSON.stringify({
            media_category: "tweet_video",
            media_type: videoType,
            total_bytes: videoSize,
          }),
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          method: "POST",
        });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }

  const initData = await response.json();
  const mediaId = initData.data.id;

  console.log("Upload initialized:", initData);

  return mediaId;
}

interface AppendUploadVideoProps {
  accessToken: string;
  chunk: Blob;
  mediaId: string;
  mode: "server" | "browser";
  segmentIndex: number;
}
async function appendUploadVideo({
  accessToken,
  chunk,
  mediaId,
  mode,
  segmentIndex,
}: Readonly<AppendUploadVideoProps>): Promise<Response> {
  if (DEBUG_POST) {
    console.log("Test Twitter: appendUploadVideo");
    await sleep(1000);
    return new Response("Test append response", {
      status: 200,
      statusText: "OK",
    });
  }

  const endpoint =
    mode === "server"
      ? `https://api.x.com/2/media/upload/${mediaId}/append`
      : `/api/browser/twitter/2/media/upload/${mediaId}/append`;

  const formData = new FormData();
  if (accessToken === "server") {
    formData.append("chunk", chunk);
    formData.append("mediaId", mediaId);
    formData.append("segmentIndex", segmentIndex.toString());
  } else {
    formData.append("media", chunk);
    formData.append("segment_index", segmentIndex.toString());
  }

  const appendResponse =
    accessToken === "server"
      ? await fetch(`/api/hosted/twitter/media/append`, {
          body: formData,
          method: "POST",
        })
      : await fetch(endpoint, {
          body: formData,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          method: "POST",
        });

  if (!appendResponse.ok) {
    const errorData = await appendResponse.json();
    throw new Error(errorData.error);
  }

  return appendResponse;
}

interface FinalizeUploadVideoProps {
  accessToken: string;
  mediaId: string;
  mode: "server" | "browser";
}
async function finalizeUploadVideo({
  accessToken,
  mediaId,
  mode,
}: Readonly<FinalizeUploadVideoProps>): Promise<TwitterFinalizeUploadResponse> {
  if (DEBUG_POST) {
    console.log("Test Twitter: finalizeUploadVideo");
    await sleep(1000);
    return {
      data: {
        media_id: "test",
        media_key: "test",
        processing_info: {
          check_after_secs: 4,
          error: {
            message: "test",
          },
          state: "test",
        },
      },
    };
  }

  const endpoint =
    mode === "server"
      ? `https://api.x.com/2/media/upload/${mediaId}/finalize`
      : `/api/browser/twitter/2/media/upload/${mediaId}/finalize`;

  const finalizeResponse =
    accessToken === "server"
      ? await fetch(`/api/hosted/twitter/media/finalize`, {
          body: JSON.stringify({
            mediaId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        })
      : await fetch(endpoint, {
          body: JSON.stringify({}),
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          method: "POST",
        });

  if (!finalizeResponse.ok) {
    const errorData = await finalizeResponse.json();
    throw new Error(errorData.error);
  }

  const finalizeData = await finalizeResponse.json();
  console.log("Upload finalized:", finalizeData);

  return finalizeData;
}

interface StatusUploadVideoProps {
  accessToken: string;
  mediaId: string;
  mode: "server" | "browser";
}
async function statusUploadVideo({
  accessToken,
  mediaId,
  mode,
}: Readonly<StatusUploadVideoProps>): Promise<TwitterStatusUploadResponse> {
  if (DEBUG_POST) {
    if (DEBUG_STATUS_STEP === 4) {
      DEBUG_STATUS_STEP = 0;
    }
    DEBUG_STATUS_STEP++;
    console.log("Test Twitter: statusUploadVideo");
    // await sleep(1000);

    return {
      data: {
        processing_info: {
          check_after_secs: 4,
          error: {
            message: "",
          },
          state: DEBUG_STATUS_STEP === 4 ? "succeeded" : "in_progress",
        },
      },
    };
  }

  const params = new URLSearchParams({
    command: "STATUS",
    media_id: mediaId,
  });

  const endpoint =
    mode === "server"
      ? `https://api.x.com/2/media/upload?${params.toString()}`
      : `/api/browser/twitter/2/media/upload?${params.toString()}`;

  const response =
    accessToken === "server"
      ? await fetch(`/api/hosted/twitter/media/status`, {
          body: JSON.stringify({
            mediaId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        })
      : await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }

  const statusData = await response.json();
  console.log("Processing status:", statusData);

  return statusData;
}

interface UploadVideoProps {
  accessToken: string;
  mode: "server" | "browser";
  setProcessProgress: (progress: number) => void;
  setProcessStatus: (status: string) => void;
  video: File;
}
async function uploadVideo({
  accessToken,
  mode,
  setProcessProgress,
  setProcessStatus,
  video,
}: Readonly<UploadVideoProps>): Promise<string> {
  // Step 1: INIT - Initialize the upload
  setProcessProgress(10);
  setProcessStatus("Initializing upload...");
  const mediaId = await initializeUploadVideo({
    accessToken,
    mode,
    videoSize: video.size,
    videoType: video.type,
  });

  setProcessProgress(20);
  setProcessStatus("Uploading video chunks...");

  // Step 2: APPEND - Upload the file in chunks
  // 4MB chunks
  const chunkSize = 1024 * 1024 * 4;
  const totalChunks = Math.ceil(video.size / chunkSize);

  for (let segmentIndex = 0; segmentIndex < totalChunks; segmentIndex++) {
    const start = segmentIndex * chunkSize;
    const end = Math.min(start + chunkSize, video.size);
    const chunk = video.slice(start, end);

    // eslint-disable-next-line no-await-in-loop
    await appendUploadVideo({
      accessToken,
      chunk,
      mediaId,
      mode,
      segmentIndex,
    });

    const progress = 20 + ((segmentIndex + 1) / totalChunks) * 50;
    setProcessProgress(Math.round(progress));
    setProcessStatus(`Uploading chunk ${segmentIndex + 1}/${totalChunks}...`);
  }

  // Step 3: FINALIZE - Complete the upload
  setProcessProgress(70);
  setProcessStatus("Finalizing upload...");
  const finalizeData = await finalizeUploadVideo({
    accessToken,
    mediaId,
    mode,
  });

  // Step 4: Check processing status if needed
  if (finalizeData.data?.processing_info) {
    setProcessProgress(75);
    setProcessStatus("Processing video...");

    await new Promise((resolve) => {
      setTimeout(
        resolve,
        (finalizeData.data?.processing_info?.check_after_secs ?? 0) * 1000 ||
          5000,
      );
    });

    let processingComplete = false;
    let attempts = 0;
    const maxAttempts = 60;

    while (!processingComplete && attempts < maxAttempts) {
      // eslint-disable-next-line no-await-in-loop
      const statusData = await statusUploadVideo({
        accessToken,
        mediaId,
        mode,
      });

      if (statusData.data?.processing_info?.state === "failed") {
        const errorMessage =
          statusData.data.processing_info.error?.message ?? "Unknown error";
        throw new Error(`Video processing failed: ${errorMessage}`);
      }

      if (statusData.data?.processing_info?.state === "in_progress") {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => {
          setTimeout(
            resolve,
            (statusData.data?.processing_info?.check_after_secs ?? 5) * 1000,
          );
        });
      }

      if (statusData.data?.processing_info?.state === "succeeded") {
        processingComplete = true;
      }

      const progress = 75 + (attempts / maxAttempts) * 15;
      setProcessProgress(Math.round(progress));
      setProcessStatus(`Processing video... (${attempts + 1}/${maxAttempts})`);

      attempts++;
    }

    if (!processingComplete) {
      throw new Error("Video processing timed out");
    }
  }

  return mediaId;
}

interface PublishPostProps {
  accessToken: string;
  mediaIds: string[];
  mode: "server" | "browser";
  text: string;
}
async function publishPost({
  accessToken,
  mediaIds,
  mode,
  text,
}: Readonly<PublishPostProps>): Promise<string> {
  if (DEBUG_POST) {
    console.log("Test Twitter: publishPost");
    await sleep(1000);
    return "test";
  }

  const endpoint =
    mode === "server"
      ? "https://api.x.com/2/posts"
      : "/api/browser/twitter/2/posts";

  const response =
    accessToken === "server"
      ? await fetch(`/api/hosted/twitter/posts`, {
          body: JSON.stringify({
            mediaIds,
            text,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        })
      : await fetch(endpoint, {
          body: JSON.stringify({ media: { media_ids: mediaIds }, text }),
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          method: "POST",
        });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Post creation failed: ${errorData.error}`);
  }

  const result = await response.json();
  console.log("Post created successfully:", result);

  return result.data.id;
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId,
  video,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  videoHSLUrl,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  videoUrl,
}: Readonly<PostServiceCreatePostProps>): Promise<string | null> {
  try {
    if (DEBUG_POST) {
      // eslint-disable-next-line no-param-reassign
      video = new File(["a"], "test.mp4", { type: "video/mp4" });
    }

    setIsProcessing(true);
    setProcessError("");
    setProcessProgress(0);
    setProcessStatus("");

    let postId = "";
    if (video) {
      // Upload video to Twitter
      const mediaId = await uploadVideo({
        accessToken,
        mode: "browser",
        setProcessProgress,
        setProcessStatus,
        video,
      });

      setProcessProgress(90);
      setProcessStatus("Publishing post...");

      // Create post with media
      postId = await publishPost({
        accessToken,
        mediaIds: [mediaId],
        mode: "browser",
        text,
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
  }

  return null;
}

export {
  appendUploadVideo,
  createPost,
  finalizeUploadVideo,
  initializeUploadVideo,
  publishPost,
  statusUploadVideo,
  VIDEO_MAX_DURATION,
  VIDEO_MAX_FILESIZE,
  VIDEO_MIN_DURATION,
};
