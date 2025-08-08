import type { Agent } from "@atproto/api";
import { BlobRef } from "@atproto/lexicon";

import { DEBUG_POST } from "@/config/constants";
import { sleep } from "@/lib/utils";
import { createAgent } from "@/services/post/bluesky/oauth-client-browser";
import type { BlueskyCredentials } from "@/services/post/types";

// 100MB
const VIDEO_MAX_FILESIZE = 1024 * 1024 * 100;
// 3 seconds
const VIDEO_MIN_DURATION = 3;
// 3 minutes
const VIDEO_MAX_DURATION = 180;

interface AgentPostVideo {
  agent: Agent;
  blobRef: BlobRef;
  text: string;
  title: string;
}
async function agentPostVideo({
  agent,
  blobRef,
  text,
  title,
}: Readonly<AgentPostVideo>): Promise<{
  uri: string;
  cid: string;
}> {
  return await agent.post({
    createdAt: new Date().toISOString(),
    embed: {
      $type: "app.bsky.embed.video",
      alt: title,
      video: blobRef,
    },
    text,
  });
}

interface AgentUploadBlob {
  agent: Agent;
  video: Blob;
  videoType: string;
}

async function agentUploadBlob({
  agent,
  video,
  videoType,
}: Readonly<AgentUploadBlob>) {
  const videoBytes = new Uint8Array(await video.arrayBuffer());

  return await agent.uploadBlob(videoBytes, {
    encoding: videoType,
  });
}

interface UploadVideoBlobProps {
  accessToken: string;
  credentials: BlueskyCredentials;
  video: Blob;
  videoType: string;
  videoUrl: string;
}

async function uploadVideoBlob({
  accessToken,
  credentials,
  video,
  videoType,
  videoUrl,
}: Readonly<UploadVideoBlobProps>): Promise<BlobRef> {
  if (DEBUG_POST) {
    console.log("Test Bluesky: uploadVideoBlob");
    await sleep(6000);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return { ref: { $link: "test-blob-ref" } } as BlobRef;
  }

  try {
    if (accessToken === "hosted") {
      // const formData = new FormData();
      // formData.append("video", video);
      // formData.append("videoType", videoType.toString());

      // const response = await fetch(`/api/hosted/bluesky/upload_blob`, {
      //   body: formData,
      //   method: "POST",
      // });

      const response = await fetch(`/api/hosted/bluesky/upload_blob_url`, {
        body: JSON.stringify({
          videoType,
          videoUrl,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Video upload failed: ${errorData.error_description ?? errorData.error}`,
        );
      }

      const result = await response.json();
      console.log("Video blob uploaded successfully:", result);

      return result.data.blob;
    }

    const agent = await createAgent(credentials, accessToken);

    const result = await agentUploadBlob({ agent, video, videoType });
    console.log("Video blob uploaded successfully:", result);

    return result.data.blob;
  } catch (error) {
    console.error("Failed to upload video blob:", error);
    throw new Error(
      `Failed to upload video: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

interface CreateRecordProps {
  accessToken: string;
  blobRef: BlobRef;
  credentials: BlueskyCredentials;
  text: string;
  title: string;
}

async function createRecord({
  accessToken,
  blobRef,
  credentials,
  text,
  title,
}: Readonly<CreateRecordProps>): Promise<string> {
  if (DEBUG_POST) {
    console.log("Test Bluesky: createRecord");
    await sleep(1000);
    return "test";
  }

  try {
    if (accessToken === "hosted") {
      const response = await fetch(`/api/hosted/bluesky/post`, {
        body: JSON.stringify({
          blobRef,
          text,
          title,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Token exchange failed: ${errorData.error_description ?? errorData.error}`,
        );
      }

      const result = await response.json();

      console.log("Post created successfully:", result);

      return result.uri;
    }

    const agent = await createAgent(credentials, accessToken);

    const result = await agentPostVideo({
      agent,
      blobRef,
      text,
      title,
    });

    console.log("Post created successfully:", result);

    return result.uri;
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
  videoUrl: string;
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
  videoUrl,
}: Readonly<CreatePostProps>): Promise<string | null> {
  let progressInterval = null;

  try {
    if (DEBUG_POST) {
      // eslint-disable-next-line no-param-reassign
      video = new File(["a"], "test.mp4", { type: "video/mp4" });
    }

    setIsPosting(true);
    setPostError("");
    setPostProgress(0);
    setPostStatus("");

    let postUri = "";

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

      const blobRef = await uploadVideoBlob({
        accessToken,
        credentials,
        video,
        videoType: video.type,
        videoUrl,
      });

      clearInterval(progressInterval);

      // Step 2: Create post
      setPostStatus("Publishing post...");
      setPostProgress(90);

      postUri = await createRecord({
        accessToken,
        blobRef,
        credentials,
        text,
        title,
      });
    } else {
      // TODO: Text only post.
      throw new Error("Text only posts are not supported yet.");

      // // Text-only post (much simpler with Agent!)
      // setPostStatus("Publishing post...");
      // setPostProgress(50);

      // const response = await agent.post({
      //   createdAt: new Date().toISOString(),
      //   text,
      // });

      // postUri = response.uri;
    }

    setPostProgress(100);
    setPostStatus("Success");

    // Extract post ID from the URI (at://did:plc:abc.../app.bsky.feed.post/POST_ID)
    // const postId = postUri.split("/").pop() ?? postUri;

    return postUri;
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
  agentPostVideo,
  agentUploadBlob,
  createPost,
  VIDEO_MAX_DURATION,
  VIDEO_MAX_FILESIZE,
  VIDEO_MIN_DURATION,
};
