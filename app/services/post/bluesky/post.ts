import type { BlueskyCredentials } from "@/app/services/post/types";

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
    // if (response.status === 401) {
    //   // Try to refresh session
    //   const refreshed = await refreshSession();
    //   if (refreshed) {
    //     // Retry upload with new token
    //     return uploadVideoBlob(file);
    //   }
    // }

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
  // session: string;
  text: string;
  title: string;
  username: string;
  videoBlob: string;
}
async function createRecord({
  accessToken,
  credentials,
  // session,
  text,
  title,
  username,
  videoBlob,
}: Readonly<CreateRecordProps>): Promise<string> {
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
        // repo: session.did,
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
    // if (response.status === 401) {
    //   // Try to refresh session
    //   const refreshed = await refreshSession();
    //   if (refreshed) {
    //     // Retry post creation with new token
    //     return createBlueskyPost(videoBlob);
    //   }
    // }

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

    setIsPosting(true);
    setPostError("");
    setPostProgress(0);
    setPostStatus("Starting upload...");

    // Step 1: Upload video blob (0-70% progress)
    setPostProgress(10);

    // Simulate progress during upload
    let progress = 0;
    progressInterval = setInterval(() => {
      progress = progress < 90 ? progress + 5 : progress;
      setPostProgress(progress);
    }, 2000);

    let postId = null;
    if (video) {
      const videoBlob = await uploadVideoBlob({
        accessToken,
        credentials,
        video,
      });

      clearInterval(progressInterval);
      setPostProgress(70);

      // Step 2: Create post (70-100% progress)
      setPostStatus("Creating Bluesky post...");
      setPostProgress(80);

      postId = await createRecord({
        accessToken,
        credentials,
        text,
        title,
        username,
        videoBlob,
      });
    }

    setPostProgress(100);
    setPostStatus(`✅ Successfully posted to Bluesky! Post ID: ${postId}`);

    return postId;
  } catch (err: unknown) {
    console.error("Post error:", err);

    const errMessage = err instanceof Error ? err.message : "Post failed";
    setPostError(`Post failed: ${errMessage}`);
    setPostStatus("❌ Post failed");
  } finally {
    setIsPosting(false);
    // Clear progress interval
    if (progressInterval) {
      clearInterval(progressInterval);
    }
  }

  return null;
}

export { createPost };
