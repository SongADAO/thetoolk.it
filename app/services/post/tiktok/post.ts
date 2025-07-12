interface UploadVideoProps {
  accessToken: string;
  text: string;
  title: string;
  videoUrl: string;
}
async function uploadVideo({
  accessToken,
  text,
  title,
  videoUrl,
}: Readonly<UploadVideoProps>) {
  // Single API call with both video source and post data
  const response = await fetch("/api/tiktok/publish", {
    body: JSON.stringify({
      accessToken,
      postData: {
        allowComments: true,
        allowDuet: true,
        allowStitch: true,
        description: text,
        privacy: "PUBLIC_TO_EVERYONE",
        title,
      },
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
      `Video publish failed: ${errorData.error?.message ?? response.statusText}`,
    );
  }

  const result = await response.json();

  return result.data.publish_id;
}

// Create a post
interface CreatePostProps {
  accessToken: string;
  setIsPosting: (isPosting: boolean) => void;
  setPostError: (error: string) => void;
  setPostProgress: (progress: number) => void;
  setPostStatus: (status: string) => void;
  title: string;
  text: string;
  userId: string;
  video: File | null;
  videoUrl: string;
}
async function createPost({
  accessToken,
  setIsPosting,
  setPostError,
  setPostProgress,
  setPostStatus,
  text,
  title,
  videoUrl,
}: Readonly<CreatePostProps>): Promise<string | null> {
  let progressInterval = null;

  try {
    setIsPosting(true);
    setPostError("");
    setPostProgress(0);
    setPostStatus("");

    setPostStatus("Uploading video to TikTok...");

    // Simulate progress updates during upload
    let progress = 0;
    progressInterval = setInterval(() => {
      progress = progress < 90 ? progress + 5 : progress;
      setPostProgress(progress);
    }, 2000);

    // Upload video directly to Facebook
    let postId = "";
    if (videoUrl) {
      postId = await uploadVideo({
        accessToken,
        text,
        title,
        videoUrl,
      });
    } else {
      // TODO: Text only post.
    }

    setPostProgress(100);
    setPostStatus(`✅ Successfully posted to TikTook! Post ID: ${postId}`);

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
