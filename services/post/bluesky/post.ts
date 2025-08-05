import type { Agent } from "@atproto/api";

import { DEBUG_POST } from "@/config/constants";
import { sleep } from "@/lib/utils";
import { createAgent } from "@/services/post/bluesky/auth";
import type { BlueskyCredentials } from "@/services/post/types";

// 100MB
const VIDEO_MAX_FILESIZE = 1024 * 1024 * 100;
// 3 seconds
const VIDEO_MIN_DURATION = 3;
// 3 minutes
const VIDEO_MAX_DURATION = 180;

interface BlueskyVideoBlobResponse {
  ref: {
    $link: string;
  };
}

interface UploadVideoBlobProps {
  agent: Agent;
  video: File;
}

async function uploadVideoBlob({
  agent,
  video,
}: Readonly<UploadVideoBlobProps>): Promise<BlueskyVideoBlobResponse> {
  if (DEBUG_POST) {
    console.log("Test Bluesky: uploadVideoBlob");
    await sleep(6000);
    return { ref: { $link: "test-blob-ref" } };
  }

  try {
    // Convert file to Uint8Array for the Agent
    const fileBuffer = await video.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    // Use Agent's uploadBlob method - it handles OAuth authentication automatically
    const response = await agent.uploadBlob(fileBytes, {
      encoding: video.type,
    });

    console.log("Video blob uploaded successfully:", response);
    return response.data.blob;
  } catch (error) {
    console.error("Failed to upload video blob:", error);
    throw new Error(
      `Failed to upload video: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

interface CreateRecordProps {
  agent: Agent;
  text: string;
  title: string;
  videoBlob: BlueskyVideoBlobResponse;
}

async function createRecord({
  agent,
  text,
  title,
  videoBlob,
}: Readonly<CreateRecordProps>): Promise<string> {
  if (DEBUG_POST) {
    console.log("Test Bluesky: createRecord");
    await sleep(1000);
    return "test";
  }

  try {
    // Create the post record
    const postRecord = {
      createdAt: new Date().toISOString(),
      embed: {
        $type: "app.bsky.embed.video",
        alt: title,
        video: videoBlob,
      },
      text,
    };

    // Use Agent's post method - it handles authentication and repo automatically
    const response = await agent.post(postRecord);

    console.log("Post created successfully:", response);

    // Extract post ID from the URI (at://did:plc:abc.../app.bsky.feed.post/POST_ID)
    return response.uri.split("/").pop() ?? response.uri;
  } catch (error) {
    console.error("Failed to create post:", error);
    throw new Error(
      `Failed to create post: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Updated interface - much simpler now!
interface CreatePostProps {
  accessToken: string;
  credentials: BlueskyCredentials;
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
  credentials,
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
    if (DEBUG_POST) {
      // eslint-disable-next-line no-param-reassign
      video = new File(["a"], "test.mp4", { type: "video/mp4" });
    }

    const agent = await createAgent(credentials, accessToken);

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
        agent,
        video,
      });

      clearInterval(progressInterval);

      // Step 2: Create post
      setPostStatus("Publishing post...");
      setPostProgress(90);

      postId = await createRecord({
        agent,
        text,
        title,
        videoBlob,
      });
    } else {
      // Text-only post (much simpler with Agent!)
      setPostStatus("Publishing post...");
      setPostProgress(50);

      const response = await agent.post({
        createdAt: new Date().toISOString(),
        text,
      });

      postId = response.uri.split("/").pop() ?? response.uri;
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
