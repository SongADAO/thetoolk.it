import { DEBUG_POST } from "@/app/config/constants";
import { sleep } from "@/app/lib/utils";

let DEBUG_STATUS_STEP = 0;

const VIDEO_MAX_FILESIZE = 512;
const VIDEO_MIN_DURATION = 3;
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
  video: File;
}
async function initializeUploadVideo({
  accessToken,
  video,
}: Readonly<InitializeUploadVideoProps>): Promise<string> {
  if (DEBUG_POST) {
    console.log("Test Twitter: initializeUploadVideo");
    await sleep(1000);
    return "test";
  }

  const initResponse = await fetch("/api/twitter/2/media/upload/initialize", {
    body: JSON.stringify({
      media_category: "tweet_video",
      media_type: video.type,
      total_bytes: video.size,
    }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!initResponse.ok) {
    const errorData = await initResponse.json();
    throw new Error(errorData.error);
  }

  const initData = await initResponse.json();
  const mediaId = initData.data.id;

  console.log("Upload initialized:", initData);

  return mediaId;
}

interface AppendUploadVideoProps {
  accessToken: string;
  chunkSize: number;
  mediaId: string;
  segmentIndex: number;
  video: File;
}
async function appendUploadVideo({
  accessToken,
  chunkSize,
  mediaId,
  segmentIndex,
  video,
}: Readonly<AppendUploadVideoProps>): Promise<void> {
  if (DEBUG_POST) {
    console.log("Test Twitter: appendUploadVideo");
    await sleep(1000);
    return;
  }

  const start = segmentIndex * chunkSize;
  const end = Math.min(start + chunkSize, video.size);
  const chunk = video.slice(start, end);

  const formData = new FormData();
  formData.append("segment_index", segmentIndex.toString());
  formData.append("media", chunk);
  // Include mediaId for the route
  formData.append("mediaId", mediaId);

  const appendResponse = await fetch("/api/twitter/2/media/upload/append", {
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
}

interface FinalizeUploadVideoProps {
  accessToken: string;
  mediaId: string;
}
async function finalizeUploadVideo({
  accessToken,
  mediaId,
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

  const finalizeResponse = await fetch("/api/twitter/2/media/upload/finalize", {
    body: JSON.stringify({
      mediaId,
    }),
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
}
async function statusUploadVideo({
  accessToken,
  mediaId,
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
    media_id: mediaId,
  });

  const statusResponse = await fetch(
    `/api/twitter/2/media/upload/status?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!statusResponse.ok) {
    const errorData = await statusResponse.json();
    throw new Error(errorData.error);
  }

  const statusData = await statusResponse.json();
  console.log("Processing status:", statusData);

  return statusData;
}

interface UploadVideoProps {
  accessToken: string;
  video: File;
  setPostProgress: (progress: number) => void;
  setPostStatus: (status: string) => void;
}
async function uploadVideo({
  accessToken,
  setPostProgress,
  setPostStatus,
  video,
}: Readonly<UploadVideoProps>): Promise<string> {
  // Step 1: INIT - Initialize the upload
  setPostProgress(10);
  setPostStatus("Initializing upload...");
  const mediaId = await initializeUploadVideo({
    accessToken,
    video,
  });

  setPostProgress(20);
  setPostStatus("Uploading video chunks...");

  // Step 2: APPEND - Upload the file in chunks
  // 4MB chunks
  const chunkSize = 1024 * 1024 * 4;
  const totalChunks = Math.ceil(video.size / chunkSize);

  for (let segmentIndex = 0; segmentIndex < totalChunks; segmentIndex++) {
    // eslint-disable-next-line no-await-in-loop
    await appendUploadVideo({
      accessToken,
      chunkSize,
      mediaId,
      segmentIndex,
      video,
    });

    const progress = 20 + ((segmentIndex + 1) / totalChunks) * 50;
    setPostProgress(Math.round(progress));
    setPostStatus(`Uploading chunk ${segmentIndex + 1}/${totalChunks}...`);
  }

  // Step 3: FINALIZE - Complete the upload
  setPostProgress(70);
  setPostStatus("Finalizing upload...");
  const finalizeData = await finalizeUploadVideo({
    accessToken,
    mediaId,
  });

  // Step 4: Check processing status if needed
  if (finalizeData.data?.processing_info) {
    setPostProgress(75);
    setPostStatus("Processing video...");

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
            (statusData.data?.processing_info?.check_after_secs ?? 0) * 1000 ||
              5000,
          );
        });
      }

      if (statusData.data?.processing_info?.state === "succeeded") {
        processingComplete = true;
      }

      const progress = 75 + (attempts / maxAttempts) * 15;
      setPostProgress(Math.round(progress));
      setPostStatus(`Processing video... (${attempts + 1}/${maxAttempts})`);

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
  text: string;
}
async function publishPost({
  accessToken,
  mediaIds,
  text,
}: Readonly<PublishPostProps>): Promise<string> {
  if (DEBUG_POST) {
    console.log("Test Twitter: publishPost");
    await sleep(1000);
    return "test";
  }

  const response = await fetch("/api/twitter/2/posts", {
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

// Create a post
interface CreatePostProps {
  accessToken: string;
  setIsPosting: (isPosting: boolean) => void;
  setPostError: (error: string) => void;
  setPostProgress: (progress: number) => void;
  setPostStatus: (status: string) => void;
  text: string;
  video: File | null;
}
async function createPost({
  accessToken,
  setIsPosting,
  setPostError,
  setPostProgress,
  setPostStatus,
  text,
  video,
}: Readonly<CreatePostProps>): Promise<string | null> {
  try {
    setIsPosting(true);
    setPostError("");
    setPostProgress(0);
    setPostStatus("");

    let postId = "";
    if (video) {
      // Upload video to Twitter
      const mediaId = await uploadVideo({
        accessToken,
        setPostProgress,
        setPostStatus,
        video,
      });

      setPostProgress(90);
      setPostStatus("Publishing post...");

      // Create post with media
      postId = await publishPost({
        accessToken,
        mediaIds: [mediaId],
        text,
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
  }

  return null;
}

export {
  createPost,
  VIDEO_MAX_DURATION,
  VIDEO_MAX_FILESIZE,
  VIDEO_MIN_DURATION,
};
