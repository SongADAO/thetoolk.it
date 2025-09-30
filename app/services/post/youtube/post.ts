import { DEBUG_POST } from "@/app/config/constants";
import { sleep } from "@/app/lib/utils";

// 128GB
const VIDEO_MAX_FILESIZE = 1024 * 1024 * 1024 * 128;
// 3 seconds
const VIDEO_MIN_DURATION = 3;
// 12 hours
const VIDEO_MAX_DURATION = 60 * 24 * 12 - 1;

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
  if (DEBUG_POST) {
    console.log("Test YouTube: initiateResumableUpload");
    await sleep(6000);
    return "test";
  }

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
  if (DEBUG_POST) {
    console.log("Test YouTube: uploadFileInChunks");
    await sleep(6000);
    return "test";
  }

  // 4MB chunks
  const CHUNK_SIZE = 1024 * 1024 * 4;

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
  let progressInterval = null;

  try {
    setIsPosting(true);
    setPostError("");
    setPostProgress(0);
    setPostStatus("");

    let postId = "";
    if (video) {
      // Step 1: Upload video blob
      setPostProgress(10);
      setPostStatus("Uploading post...");

      // Simulate progress during upload
      let progress = 10;
      progressInterval = setInterval(() => {
        progress = progress < 90 ? progress + 5 : progress;
        setPostProgress(progress);
      }, 2000);

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

      // Start resumable upload
      const uploadUrl = await initiateResumableUpload({
        accessToken,
        metadata,
        video,
      });

      clearInterval(progressInterval);

      setPostProgress(90);
      setPostStatus("Publishing post...");

      postId = await uploadFileInChunks({
        accessToken,
        setPostProgress,
        setPostStatus,
        uploadUrl,
        video,
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
  VIDEO_MAX_DURATION,
  VIDEO_MAX_FILESIZE,
  VIDEO_MIN_DURATION,
};
