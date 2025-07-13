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
  setPostProgress(10);
  setPostStatus("Uploading video chunks...");

  // Step 2: APPEND - Upload the file in chunks
  // 4MB chunks
  const chunkSize = 4 * 1024 * 1024;
  const totalChunks = Math.ceil(video.size / chunkSize);

  for (let segmentIndex = 0; segmentIndex < totalChunks; segmentIndex++) {
    const start = segmentIndex * chunkSize;
    const end = Math.min(start + chunkSize, video.size);
    const chunk = video.slice(start, end);

    const formData = new FormData();
    formData.append("segment_index", segmentIndex.toString());
    formData.append("media", chunk);
    // Include mediaId for the route
    formData.append("mediaId", mediaId);

    // eslint-disable-next-line no-await-in-loop
    const appendResponse = await fetch("/api/twitter/2/media/upload/append", {
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
    });

    if (!appendResponse.ok) {
      // eslint-disable-next-line no-await-in-loop
      const errorData = await appendResponse.json();
      throw new Error(errorData.error);
    }

    const progress = 10 + ((segmentIndex + 1) / totalChunks) * 60;
    setPostProgress(Math.round(progress));
    setPostStatus(`Uploading chunk ${segmentIndex + 1}/${totalChunks}...`);
  }

  setPostProgress(70);
  setPostStatus("Finalizing upload...");

  // Step 3: FINALIZE - Complete the upload
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

  // Step 4: Check processing status if needed
  if (finalizeData.data?.processing_info) {
    setPostProgress(75);
    setPostStatus("Processing video...");

    let processingComplete = false;
    let attempts = 0;
    const maxAttempts = 30;

    while (!processingComplete && attempts < maxAttempts) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        setTimeout(
          resolve,
          finalizeData.data.processing_info.check_after_secs * 1000 || 5000,
        );
      });

      const params = new URLSearchParams({
        media_id: mediaId,
      });

      // eslint-disable-next-line no-await-in-loop
      const statusResponse = await fetch(
        `/api/twitter/2/media/upload/status?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (statusResponse.ok) {
        // eslint-disable-next-line no-await-in-loop
        const statusData = await statusResponse.json();
        console.log("Processing status:", statusData);

        if (statusData.data?.processing_info) {
          // eslint-disable-next-line max-depth
          if (statusData.data.processing_info.state === "succeeded") {
            processingComplete = true;
          } else if (statusData.data.processing_info.state === "failed") {
            throw new Error(
              `Video processing failed: ${statusData.data.processing_info.error?.message ?? "Unknown error"}`,
            );
          }

          const progress = 75 + (attempts / maxAttempts) * 15;
          setPostProgress(Math.round(progress));
          setPostStatus(`Processing video... (${attempts + 1}/${maxAttempts})`);
        } else {
          processingComplete = true;
        }
      }

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
      setPostProgress(5);
      setPostStatus("Initializing upload...");

      // Upload video to Twitter
      const mediaId = await uploadVideo({
        accessToken,
        setPostProgress,
        setPostStatus,
        video,
      });

      setPostProgress(95);
      setPostStatus("Publishing post...");

      // Create post with media
      setPostStatus("Creating post...");
      postId = await publishPost({
        accessToken,
        mediaIds: [mediaId],
        text,
      });
    } else {
      // TODO: Text only post.
    }

    setPostProgress(100);
    setPostStatus(`✅ Successfully posted to Twitter! Post ID: ${postId}`);

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
