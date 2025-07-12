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
  const response = await fetch("/api/tiktok/v2/post/publish/video/init/", {
    body: JSON.stringify({
      post_info: {
        description: text,
        disable_comment: false,
        disable_duet: false,
        disable_stitch: false,
        // TODO: tiktok can only post to private accounts in sandbox
        // privacy_level: "PUBLIC_TO_EVERYONE",
        privacy_level: "SELF_ONLY",
        title,
        video_cover_timestamp_ms: 1000,
      },
      source_info: {
        source: "PULL_FROM_URL",
        video_url: videoUrl,
      },
    }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Video publish failed: ${errorData?.details?.error?.code ?? 0} - ${errorData?.details?.error?.message ?? response.statusText}`,
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
