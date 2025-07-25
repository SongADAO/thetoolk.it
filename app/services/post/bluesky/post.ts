import { DEBUG_POST } from "@/app/config/constants";
import { sleep } from "@/app/lib/utils";
import type { BlueskyCredentials } from "@/app/services/post/types";

// 100MB
const VIDEO_MAX_FILESIZE = 1024 * 1024 * 100;
// 3 seconds
const VIDEO_MIN_DURATION = 3;
// 3 minutes
const VIDEO_MAX_DURATION = 180;

interface UploadVideoBlobProps {
  accessToken: string;
  credentials: BlueskyCredentials;
  video: File;
}
async function uploadVideoBlob({
  accessToken,
  credentials,
  video,
}: Readonly<UploadVideoBlobProps>): Promise<string> {
  if (DEBUG_POST) {
    console.log("Test Bluesky: uploadVideoBlob");
    await sleep(6000);
    return "test";
  }

  // Convert file to ArrayBuffer
  const fileBuffer = await video.arrayBuffer();

  const response = await fetch(
    `${credentials.serviceUrl}/xrpc/com.atproto.repo.uploadBlob`,
    {
      body: fileBuffer,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": video.type,
      },
      method: "POST",
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to upload video: ${errorData.message ?? response.statusText}`,
    );
  }

  const result = await response.json();
  console.log("Video blob uploaded successfully:", result);

  return result.blob;
}

interface CreateRecordProps {
  accessToken: string;
  credentials: BlueskyCredentials;
  text: string;
  title: string;
  username: string;
  videoBlob: string;
}
async function createRecord({
  accessToken,
  credentials,
  text,
  title,
  username,
  videoBlob,
}: Readonly<CreateRecordProps>): Promise<string> {
  if (DEBUG_POST) {
    console.log("Test Bluesky: createRecord");
    await sleep(1000);
    return "test";
  }

  const postRecord = {
    $type: "app.bsky.feed.post",
    createdAt: new Date().toISOString(),
    embed: {
      $type: "app.bsky.embed.video",
      alt: title,
      video: videoBlob,
    },
    text,
  };

  const response = await fetch(
    `${credentials.serviceUrl}/xrpc/com.atproto.repo.createRecord`,
    {
      body: JSON.stringify({
        collection: "app.bsky.feed.post",
        record: postRecord,
        repo: username,
      }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to create post: ${errorData.message ?? response.statusText}`,
    );
  }

  const result = await response.json();
  console.log("Post created successfully:", result);

  return result.uri.split("/").pop();
}

// Create a post
interface CreatePostProps {
  accessToken: string;
  credentials: BlueskyCredentials;
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
  credentials,
  setIsPosting,
  setPostError,
  setPostProgress,
  setPostStatus,
  text,
  title,
  username,
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

      const videoBlob = await uploadVideoBlob({
        accessToken,
        credentials,
        video,
      });

      clearInterval(progressInterval);

      // Step 2: Create post
      setPostStatus("Publishing post...");
      setPostProgress(90);

      postId = await createRecord({
        accessToken,
        credentials,
        text,
        title,
        username,
        videoBlob,
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
