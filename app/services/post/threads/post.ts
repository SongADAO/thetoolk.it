// Create Threads media container
interface CreateMediaContainerProps {
  accessToken: string;
  text: string;
  userId: string;
  videoUrl: string;
}
async function createMediaContainer({
  accessToken,
  text,
  userId,
  videoUrl,
}: Readonly<CreateMediaContainerProps>): Promise<string> {
  console.log("Creating Threads media container");

  const endpoint = `https://graph.threads.net/v1.0/${userId}/threads`;

  const params = {
    access_token: accessToken,
    media_type: "VIDEO",
    text,
    // reply_control: replyControl,
    video_url: videoUrl,
  };

  try {
    const response = await fetch(endpoint, {
      body: new URLSearchParams(params),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    const responseText = await response.text();
    console.log("Media container response:", responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (err: unknown) {
        console.error("Error parsing response:", err);

        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      const errorMessage = errorData.error?.message ?? "Unknown error";
      const errorCode = errorData.error?.code;

      if (
        errorMessage.includes("video file") ||
        errorMessage.includes("format")
      ) {
        throw new Error(
          `Video format issue: ${errorMessage}. Make sure your video is MP4/MOV with proper encoding.`,
        );
      } else if (errorCode === 190) {
        throw new Error(
          "Access token expired or invalid. Please re-authorize Threads access.",
        );
      } else {
        throw new Error(`Threads API Error (${errorCode}): ${errorMessage}`);
      }
    }

    const result = JSON.parse(responseText);
    console.log("Media container created successfully:", result);
    return result.id;
  } catch (error) {
    console.error("Media container creation error:", error);

    throw error;
  }
}

// Check media container status
interface CheckMediaStatusProps {
  accessToken: string;
  creationId: string;
}
async function checkMediaStatus({
  accessToken,
  creationId,
}: Readonly<CheckMediaStatusProps>): Promise<string> {
  try {
    const response = await fetch(
      `https://graph.threads.net/v1.0/${creationId}?fields=status&access_token=${accessToken}`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Status check error:", errorText);

      throw new Error(`Failed to check media status: HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("Media status check:", result);
    return result.status;
  } catch (err: unknown) {
    console.error("Error checking media status:", err);

    const errMessage =
      err instanceof Error ? err.message : "media status check failed";
    throw new Error(`Failed to check media status: ${errMessage}`);
  }
}

// Publish media to Threads
interface PublishMediaProps {
  accessToken: string;
  creationId: string;
  userId: string;
}
async function publishMedia({
  accessToken,
  creationId,
  userId,
}: Readonly<PublishMediaProps>) {
  try {
    const response = await fetch(
      `https://graph.threads.net/v1.0/${userId}/threads_publish`,
      {
        body: new URLSearchParams({
          access_token: accessToken,
          creation_id: creationId,
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      },
    );

    const responseText = await response.text();
    console.log("Publish response:", responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (err: unknown) {
        console.error("Error parsing response:", err);

        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      const errorMessage = errorData.error?.message ?? "Unknown error";
      const errorCode = errorData.error?.code;

      if (errorCode === 190) {
        throw new Error(
          "Access token expired. Please re-authorize Threads access.",
        );
      } else if (errorMessage.includes("not available")) {
        throw new Error(
          "Media container is not ready for publishing. Please wait longer for processing to complete.",
        );
      } else {
        throw new Error(`Publish Error (${errorCode}): ${errorMessage}`);
      }
    }

    const result = JSON.parse(responseText);
    console.log("Media published successfully:", result);
    return result.id;
  } catch (error) {
    console.error("Publish error:", error);

    throw error;
  }
}

// Create a post
interface CreatePostProps {
  accessToken: string;
  setIsPosting: (isPosting: boolean) => void;
  setPostError: (error: string) => void;
  setPostProgress: (progress: number) => void;
  setPostStatus: (status: string) => void;
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
  userId,
  videoUrl,
}: Readonly<CreatePostProps>): Promise<string | null> {
  try {
    setIsPosting(true);
    setPostError("");
    setPostProgress(0);
    setPostStatus("");

    // Step 2: Create media container (30-50% progress)
    const creationId = await createMediaContainer({
      accessToken,
      text,
      userId,
      videoUrl,
    });

    setPostProgress(50);
    setPostStatus("Waiting for Threads to process video...");

    // Step 3: Wait for processing (50-80% progress)
    let status = "IN_PROGRESS";
    let attempts = 0;
    // 5 minutes max
    const maxAttempts = 30;

    while (status === "IN_PROGRESS" && attempts < maxAttempts) {
      // Wait 10 seconds
      await new Promise((resolve) => setTimeout(resolve, 10000));
      status = await checkMediaStatus({ accessToken, creationId });
      attempts++;

      const progress = 50 + (attempts / maxAttempts) * 30;
      setPostProgress(Math.round(progress));
      setPostStatus(`Submitting post... (${attempts}/${maxAttempts})`);

      console.log(`Attempt ${attempts}: Status = ${status}`);
    }

    if (status !== "FINISHED") {
      if (status === "ERROR") {
        throw new Error(
          "Threads rejected the video. Please check that your video meets all format requirements.",
        );
      } else if (status === "IN_PROGRESS") {
        throw new Error(
          "Video processing timed out. This may indicate the video file doesn't meet Threads' requirements.",
        );
      } else {
        throw new Error(`Video processing failed with status: ${status}`);
      }
    }

    setPostProgress(85);
    setPostStatus("Publishing to Threads...");

    // Step 4: Publish the media (80-100% progress)
    const mediaId = await publishMedia({ accessToken, creationId, userId });

    setPostProgress(100);
    setPostStatus(`✅ Successfully posted to Threads! Media ID: ${mediaId}`);

    return mediaId;
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
