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
  video,
}: Readonly<UploadVideoProps>) {
  // Create FormData for direct upload
  const formData = new FormData();
  formData.append("source", video);
  formData.append("title", title || video.name);
  formData.append("description", text);
  formData.append("privacy", JSON.stringify({ value: "EVERYONE" }));

  const response = await fetch(
    `https://graph-video.facebook.com/v23.0/${userId}/videos`,
    {
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
    },
  );

  const responseText = await response.text();
  console.log("Facebook upload response:", responseText);

  if (!response.ok) {
    const errorData = await response.json();

    const errorCode = errorData.error?.code;
    const errorMessage = errorData.error?.message ?? "Unknown error";

    if (
      errorMessage.includes("video file") ||
      errorMessage.includes("format")
    ) {
      throw new Error(
        `Video format issue: ${errorMessage}. Make sure your video is in a supported format.`,
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
  userId,
  video,
}: Readonly<CreatePostProps>): Promise<string | null> {
  try {
    setIsPosting(true);
    setPostError("");
    setPostProgress(0);
    setPostStatus("");

    setPostStatus("Uploading video to Facebook...");

    // Simulate progress updates during upload
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress = progress < 90 ? progress + 5 : progress;
      setPostProgress(progress);
    }, 5000);

    // Upload video directly to Facebook
    const videoId = await uploadVideo({
      accessToken,
      text,
      title,
      userId,
      video,
    });

    // Clear progress interval
    clearInterval(progressInterval);

    setPostProgress(100);
    setPostStatus(`✅ Successfully posted to Facebook! Video ID: ${videoId}`);

    return videoId;
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
