// Start resumable upload
interface InitiateResumableUploadProps {
  accessToken: string;
  metadata: Record<string, unknown>;
  video: File;
}
async function initiateResumableUpload({
  accessToken,
  metadata,
  video,
}: Readonly<InitiateResumableUploadProps>): Promise<string> {
  const params = new URLSearchParams({
    part: "snippet,status",
    uploadType: "resumable",
  });

  const response = await fetch(
    `https://www.googleapis.com/upload/youtube/v3/videos?${params.toString()}`,
    {
      body: JSON.stringify(metadata),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Upload-Content-Length": video.size.toString(),
        "X-Upload-Content-Type": video.type,
      },
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to initiate upload: ${response.status} ${response.statusText}`,
    );
  }

  const uploadUrl = response.headers.get("Location");
  if (!uploadUrl) {
    throw new Error("No upload URL received from YouTube");
  }

  return uploadUrl;
}

// Upload file in chunks
interface UploadFileInChunks {
  accessToken: string;
  setPostProgress: (progress: number) => void;
  setPostStatus: (status: string) => void;
  uploadUrl: string;
  video: File;
}
async function uploadFileInChunks({
  accessToken,
  setPostProgress,
  setPostStatus,
  uploadUrl,
  video,
}: Readonly<UploadFileInChunks>): Promise<string> {
  // Chunk size for resumable uploads (256KB recommended)
  const CHUNK_SIZE = 256 * 1024;

  let uploadedBytes = 0;
  const totalBytes = video.size;

  while (uploadedBytes < totalBytes) {
    const chunk = video.slice(
      uploadedBytes,
      Math.min(uploadedBytes + CHUNK_SIZE, totalBytes),
    );
    const chunkEnd = uploadedBytes + chunk.size - 1;

    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await fetch(uploadUrl, {
        body: chunk,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Length": chunk.size.toString(),
          "Content-Range": `bytes ${uploadedBytes}-${chunkEnd}/${totalBytes}`,
        },
        method: "PUT",
      });

      if (response.status === 200 || response.status === 201) {
        // Upload complete
        // eslint-disable-next-line no-await-in-loop
        const result = await response.json();

        return result.id;
      }

      if (response.status !== 308) {
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`,
        );
      }

      // Continue uploading
      uploadedBytes += chunk.size;
      const progress = Math.round((uploadedBytes / totalBytes) * 100);
      setPostProgress(progress);
      setPostStatus(
        `Uploading... ${progress}% (${Math.round(uploadedBytes / 1024 / 1024)}MB / ${Math.round(totalBytes / 1024 / 1024)}MB)`,
      );
    } catch (error) {
      console.error("Chunk upload error:", error);

      // Try to resume from where we left off
      try {
        // eslint-disable-next-line no-await-in-loop
        const resumeResponse = await fetch(uploadUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Range": `bytes */${totalBytes}`,
          },
          method: "PUT",
        });

        if (resumeResponse.status === 308) {
          const rangeHeader = resumeResponse.headers.get("Range");
          // eslint-disable-next-line max-depth
          if (rangeHeader) {
            const rangeMatch = /bytes=0-(\d+)/u.exec(rangeHeader);

            // eslint-disable-next-line max-depth
            if (rangeMatch) {
              uploadedBytes = parseInt(rangeMatch[1], 10) + 1;
              setPostStatus(
                `Resuming upload from ${Math.round(uploadedBytes / 1024 / 1024)}MB...`,
              );

              // eslint-disable-next-line no-continue
              continue;
            }
          }
        }
      } catch (resumeError) {
        console.error("Resume failed:", resumeError);
      }

      throw error;
    }
  }

  return "";
}

// Create a post
interface CreatePostProps {
  accessToken: string;
  setIsPosting: (isPosting: boolean) => void;
  setPostError: (error: string) => void;
  setPostProgress: (progress: number) => void;
  setPostStatus: (status: string) => void;
  text: string;
  title: string;
  username: string;
  video: File | null;
}
async function createPost({
  accessToken,
  setIsPosting,
  setPostError,
  setPostProgress,
  setPostStatus,
  text,
  title,
  video,
}: Readonly<CreatePostProps>): Promise<string | null> {
  try {
    setIsPosting(true);
    setPostError("");
    setPostProgress(0);
    setPostStatus("");

    setIsPosting(true);
    setPostError("");
    setPostProgress(0);
    setPostStatus("Starting upload...");

    // Step 1: Upload video blob (0-70% progress)
    setPostProgress(10);

    // Prepare metadata
    const metadata = {
      snippet: {
        // TODO: Youtube category ID selection
        // 22 = People & Blogs
        categoryId: "22",
        description: text,
        tags: ""
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        title,
      },
      status: {
        privacyStatus: "public",
      },
    };

    let postId = "";
    if (video) {
      setPostStatus("Initiating resumable upload...");

      // Start resumable upload
      const uploadUrl = await initiateResumableUpload({
        accessToken,
        metadata,
        video,
      });

      setPostStatus("Starting video upload...");

      postId = await uploadFileInChunks({
        accessToken,
        setPostProgress,
        setPostStatus,
        uploadUrl,
        video,
      });
    } else {
      // TODO: Text only post.
    }

    setPostProgress(100);
    setPostStatus(`✅ Successfully posted to YouTube! Post ID: ${postId}`);

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
