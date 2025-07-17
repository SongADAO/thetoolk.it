interface UploadVideoProps {
  accessToken: string;
  text: string;
  title: string;
  userId: string;
  videoUrl: string;
}

async function uploadVideo({
  accessToken,
  text,
  title,
  userId,
  videoUrl,
}: Readonly<UploadVideoProps>) {
  const response = await fetch(
    `https://graph-video.facebook.com/v23.0/${userId}/videos`,
    {
      body: new URLSearchParams({
        access_token: accessToken,
        description: text,
        file_url: videoUrl,
        privacy: JSON.stringify({ value: "EVERYONE" }),
        title,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Facebook upload error response:", errorData);

    const errorCode = errorData.error?.code;
    const errorMessage = errorData.error?.message ?? "Unknown error";

    if (
      errorMessage.includes("video file") ||
      errorMessage.includes("format")
    ) {
      throw new Error(
        `Video format issue: ${errorMessage}. Make sure your video URL is accessible and in a supported format.`,
      );
    }

    if (errorCode === 190) {
      throw new Error(
        "Access token expired or invalid. Please re-authorize Facebook access.",
      );
    }

    if (errorCode === 200) {
      throw new Error(
        "Facebook permissions error. Make sure your app has the required permissions.",
      );
    }

    throw new Error(`Facebook API Error (${errorCode}): ${errorMessage}`);
  }

  const result = await response.json();
  console.log("Video uploaded successfully:", result);

  return result.id;
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
  userId,
  videoUrl,
}: Readonly<CreatePostProps>): Promise<string | null> {
  let progressInterval = null;

  try {
    setIsPosting(true);
    setPostError("");
    setPostProgress(0);
    setPostStatus("");

    // Upload video directly to Facebook using URL
    let postId = "";
    if (videoUrl) {
      setPostStatus("Uploading video to Facebook...");

      // Simulate progress updates during upload
      let progress = 0;
      progressInterval = setInterval(() => {
        progress = progress < 90 ? progress + 5 : progress;
        setPostProgress(progress);
      }, 2000);

      postId = await uploadVideo({
        accessToken,
        text,
        title,
        userId,
        videoUrl,
      });
    } else {
      // TODO: Text only post.
    }

    setPostProgress(100);
    setPostStatus("Success");

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
