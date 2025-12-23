"use client";

/* eslint-disable max-lines */

import Link from "next/link";
import { Form } from "radix-ui";
import {
  type ChangeEvent,
  type FormEvent,
  use,
  useEffect,
  useRef,
  useState,
} from "react";
import { FaCircleExclamation } from "react-icons/fa6";

import { ModalOverlay } from "@/components/general/ModalOverlay";
import { Spinner } from "@/components/general/Spinner";
import { ServiceAuthorizeButton } from "@/components/service/ServiceAuthorizeButton";
import { CreatePostContext } from "@/contexts/CreatePostContext";
import { formatFileDuration, formatFileSize } from "@/lib/video/video";
import { POST_CONTEXTS } from "@/services/post/contexts";

interface FormState {
  facebookPrivacy: string;
  text: string;
  tiktokComment: boolean;
  tiktokDisclose: boolean;
  tiktokDiscloseBrandOther: boolean;
  tiktokDiscloseBrandSelf: boolean;
  tiktokDuet: boolean;
  tiktokPrivacy: string;
  tiktokStitch: boolean;
  title: string;
  youtubePrivacy: string;
}

function fromInitial(): FormState {
  return {
    facebookPrivacy: "",
    text: "",
    tiktokComment: false,
    tiktokDisclose: false,
    tiktokDiscloseBrandOther: false,
    tiktokDiscloseBrandSelf: false,
    tiktokDuet: false,
    tiktokPrivacy: "",
    tiktokStitch: false,
    title: "",
    youtubePrivacy: "",
  };
}

function fromFormData(formData: FormData): FormState {
  return {
    facebookPrivacy: String(formData.get("facebookPrivacy")),
    text: String(formData.get("text")),
    tiktokComment: Boolean(formData.get("tiktokComment")),
    tiktokDisclose: Boolean(formData.get("tiktokDisclose")),
    tiktokDiscloseBrandOther: Boolean(formData.get("tiktokDiscloseBrandOther")),
    tiktokDiscloseBrandSelf: Boolean(formData.get("tiktokDiscloseBrandSelf")),
    tiktokDuet: Boolean(formData.get("tiktokDuet")),
    tiktokPrivacy: String(formData.get("tiktokPrivacy")),
    tiktokStitch: Boolean(formData.get("tiktokStitch")),
    title: String(formData.get("title")),
    youtubePrivacy: String(formData.get("youtubePrivacy")),
  };
}

function PostForm() {
  // Post services
  // ---------------------------------------------------------------------------
  const postPlatforms = Object.fromEntries(
    POST_CONTEXTS.map(({ context, id }) => [id, use(context)]),
  );

  const blueskyIsEnabled = postPlatforms.bluesky.isEnabled;
  const facebookIsEnabled = postPlatforms.facebook.isEnabled;
  // const neynarIsEnabled = postPlatforms.neynar.isEnabled;
  // const threadsIsEnabled = postPlatforms.threads.isEnabled;
  const tiktokIsEnabled = postPlatforms.tiktok.isEnabled;
  // const twitterIsEnabled = postPlatforms.twitter.isEnabled;
  const youtubeIsEnabled = postPlatforms.youtube.isEnabled;

  // const facebookIsUsable = postPlatforms.facebook.isUsable;
  const tiktokIsUsable = postPlatforms.tiktok.isUsable;
  const youtubeIsUsable = postPlatforms.youtube.isUsable;

  const needsTitle = blueskyIsEnabled || facebookIsEnabled || youtubeIsEnabled;

  // const needsMessage = true;

  // Facebook Settings
  // ---------------------------------------------------------------------------

  // const facebookPrivacyOptions = [
  //   { label: "Only Me", value: "SELF" },
  //   { label: "All Friends", value: "ALL_FRIENDS" },
  //   { label: "Public", value: "EVERYONE" },
  // ];

  // YouTube Settings
  // ---------------------------------------------------------------------------

  const youtubePrivacyOptions = [
    { label: "Private", value: "private" },
    { label: "Public", value: "public" },
    { label: "Unlisted", value: "unlisted" },
  ];

  // TikTok Settings
  // ---------------------------------------------------------------------------

  const allTiktokPrivacyOptions = [
    { label: "Followers", value: "FOLLOWER_OF_CREATOR" },
    {
      label: "Friends (Followers you follow back)",
      value: "MUTUAL_FOLLOW_FRIENDS",
    },
    { label: "Only You", value: "SELF_ONLY" },
  ];

  const tiktokPrivacyOptions = allTiktokPrivacyOptions.filter((option) =>
    postPlatforms.tiktok.accounts[0]?.permissions?.privacy_level_options?.includes(
      option.value,
    ),
  );

  const canTiktokComment =
    postPlatforms.tiktok.accounts.length &&
    !postPlatforms.tiktok.accounts[0]?.permissions?.comment_disabled;

  const canTiktokDuet =
    postPlatforms.tiktok.accounts.length &&
    !postPlatforms.tiktok.accounts[0]?.permissions?.duet_disabled;

  const canTiktokStitch =
    postPlatforms.tiktok.accounts.length &&
    !postPlatforms.tiktok.accounts[0]?.permissions?.stitch_disabled;

  // const canTiktokComment = true;
  // const canTiktokDuet = true;
  // const canTiktokStitch = true;

  // Posting Form
  // ---------------------------------------------------------------------------

  const {
    createPost,
    getVideoInfo,
    hasPostPlatform,
    hasStoragePlatform,
    hasUnauthorizedPostServices,
    hasUnauthorizedStorageServices,
    hlsConversionProgress,
    hlsConversionStatus,
    isHLSConverting,
    isPosting,
    isStoring,
    isVideoConverting,
    isVideoTrimming,
    preparePostVideo,
    resetPostState,
    resetStoreState,
    unauthorizedPostServices,
    unauthorizedStorageServices,
    // videoCodecInfo,
    videoConversionProgress,
    videoConversionStatus,
    videoDuration,
    videoFileSize,
    videoPreviewUrl,
    videoTrimProgress,
    videoTrimStatus,
  } = use(CreatePostContext);

  const [state, setState] = useState<FormState>(fromInitial());

  const [isPending, setIsPending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [error, setError] = useState<string>("");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    getVideoInfo(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      setIsPending(true);
      setError("");

      const formData = new FormData(event.currentTarget);
      const newFormState = fromFormData(formData);
      setState(newFormState);

      resetPostState();
      resetStoreState();

      if (!newFormState.text) {
        throw new Error("Please enter a message.");
      }

      if (needsTitle && !newFormState.title) {
        throw new Error("Please enter a title.");
      }

      if (!selectedFile) {
        throw new Error("Please select a video file.");
      }

      if (hasUnauthorizedPostServices) {
        throw new Error("Some selected posting services are not authorized.");
      }

      if (hasUnauthorizedStorageServices) {
        throw new Error("Some selected storage services are not authorized.");
      }

      const videos = await preparePostVideo(selectedFile);

      await createPost({
        facebookPrivacy: newFormState.facebookPrivacy,
        text: newFormState.text,
        tiktokComment: newFormState.tiktokComment,
        tiktokDisclose: newFormState.tiktokDisclose,
        tiktokDiscloseBrandOther: newFormState.tiktokDiscloseBrandOther,
        tiktokDiscloseBrandSelf: newFormState.tiktokDiscloseBrandSelf,
        tiktokDuet: newFormState.tiktokDuet,
        tiktokPrivacy: newFormState.tiktokPrivacy,
        tiktokStitch: newFormState.tiktokStitch,
        title: newFormState.title,
        videos,
        youtubePrivacy: newFormState.youtubePrivacy,
      });
    } catch (err: unknown) {
      console.error(err);
      const errMessage = err instanceof Error ? err.message : "Post failed";
      setError(errMessage);
    } finally {
      setIsPending(false);
    }
  }

  // Check if we should disable the form
  const isFormDisabled =
    isPending ||
    hasUnauthorizedPostServices ||
    hasUnauthorizedStorageServices ||
    !hasPostPlatform ||
    !hasStoragePlatform;

  useEffect(() => {
    if (state.tiktokPrivacy === "SELF_ONLY") {
      setState((prev) => ({
        ...prev,
        tiktokDiscloseBrandOther: false,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.tiktokPrivacy]);

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      tiktokComment: false,
      tiktokDuet: false,
      tiktokStitch: false,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canTiktokComment, canTiktokDuet, canTiktokStitch]);

  const hasIncompleteTikTokDisclosure =
    tiktokIsEnabled &&
    state.tiktokDisclose &&
    !state.tiktokDiscloseBrandSelf &&
    !state.tiktokDiscloseBrandOther;

  return (
    <div className="relative">
      <Form.Root>
        <Form.Field className="mb-4 flex flex-col" key="video" name="video">
          <Form.Label className="mb-2 font-semibold">Video</Form.Label>
          <Form.Control
            accept="video/mp4"
            autoComplete="off"
            className="w-full rounded-xs border border-gray-400 border-r-black border-b-black bg-white p-2 text-black enabled:cursor-pointer enabled:hover:bg-black enabled:hover:text-white"
            disabled={isFormDisabled}
            onChange={handleFileChange}
            placeholder="Title"
            ref={fileInputRef}
            required
            title="Video"
            type="file"
          />
          <div>
            <Form.Message match="valueMissing">Missing video.</Form.Message>
          </div>
        </Form.Field>
      </Form.Root>

      {videoPreviewUrl ? (
        <div className="mb-4 flex flex-col gap-2">
          <div>
            <video
              className="max-w-full rounded-xs border border-gray-300"
              controls
              src={videoPreviewUrl}
            />
          </div>
          <div className="flex items-center justify-between gap-2 text-sm">
            <div>Size: {formatFileSize(videoFileSize)}</div>
            <div>Duration: {formatFileDuration(videoDuration)}</div>
          </div>
          {/* <div className="flex items-center justify-between gap-2 text-sm">
            <div>Codec: {videoCodecInfo}</div>
          </div> */}
        </div>
      ) : null}

      <Form.Root onSubmit={handleSubmit}>
        {needsTitle ? (
          <Form.Field className="mb-4 flex flex-col" key="title" name="title">
            <Form.Label className="mb-2 font-semibold">Video Title</Form.Label>
            <Form.Control
              autoComplete="off"
              className="w-full rounded-xs text-black"
              disabled={isFormDisabled}
              onChange={(e) =>
                setState((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter the title for your video."
              required
              title="Media Title"
              type="text"
              value={state.title}
            />
            <div>
              <Form.Message match="valueMissing">
                Missing video title.
              </Form.Message>
            </div>
          </Form.Field>
        ) : (
          <input name="title" type="hidden" value="" />
        )}

        <Form.Field className="mb-4 flex flex-col" key="text" name="text">
          <Form.Label className="mb-2 font-semibold">
            Message / Caption / Description
          </Form.Label>
          <Form.Control
            asChild
            autoComplete="off"
            className="w-full rounded-xs text-black"
            disabled={isFormDisabled}
            onChange={(e) =>
              setState((prev) => ({ ...prev, text: e.target.value }))
            }
            placeholder="Enter the text that will appear as your post message, video caption, or video description depending on platform."
            required
            title="Message / Caption / Description"
            value={state.text}
          >
            <textarea rows={6} />
          </Form.Control>
          <div>
            <Form.Message match="valueMissing">Missing message.</Form.Message>
          </div>
        </Form.Field>

        {/* {facebookIsEnabled && facebookIsUsable ? (
          <section className="mb-4 rounded-xs border border-gray-400 border-r-black border-b-black bg-gray-100 p-2">
            <h4 className="mb-2 font-semibold">Facebook Settings</h4>
            <Form.Field
              className="mb-4 flex flex-col"
              key="facebookPrivacy"
              name="facebookPrivacy"
            >
              <Form.Label className="mb-2 font-semibold">
                Who can view this video
              </Form.Label>
              <Form.Control
                asChild
                className="w-full rounded-xs text-black"
                disabled={isFormDisabled}
                required
                title="Who can view this video"
                value={state.facebookPrivacy}
              >
                <select
                  onInput={(e: ChangeEvent<HTMLSelectElement>) =>
                    setState((prev) => ({
                      ...prev,
                      facebookPrivacy: e.target.value,
                    }))
                  }
                >
                  <option key="none" value="">
                    Select Facebook Privacy Settings
                  </option>
                  {facebookPrivacyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Form.Control>
              <div>
                <Form.Message match="valueMissing">
                  Missing Facebook Privacy Settings.
                </Form.Message>
              </div>
            </Form.Field>
          </section>
        ) : (
          <Form.Field
            className="mb-4 flex flex-col"
            key="facebookPrivacy"
            name="facebookPrivacy"
          >
            <Form.Control type="hidden" value={state.youtubePrivacy} />
          </Form.Field>
        )} */}

        {youtubeIsEnabled && youtubeIsUsable ? (
          <section className="mb-4 rounded-xs border border-gray-400 border-r-black border-b-black bg-gray-100 p-2">
            <h4 className="mb-2 font-semibold">YouTube Settings</h4>
            <Form.Field
              className="flex flex-col"
              key="youtubePrivacy"
              name="youtubePrivacy"
            >
              <Form.Label className="mb-2 font-semibold">
                Who can view this video
              </Form.Label>
              <Form.Control
                asChild
                className="w-full rounded-xs text-black"
                disabled={isFormDisabled}
                required
                title="Who can view this video"
                value={state.youtubePrivacy}
              >
                <select
                  onInput={(e: ChangeEvent<HTMLSelectElement>) =>
                    setState((prev) => ({
                      ...prev,
                      youtubePrivacy: e.target.value,
                    }))
                  }
                >
                  <option key="none" value="">
                    Select YouTube Privacy Settings
                  </option>
                  {youtubePrivacyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Form.Control>
              <div>
                <Form.Message match="valueMissing">
                  Missing YouTube Privacy Settings.
                </Form.Message>
              </div>
            </Form.Field>
          </section>
        ) : (
          <input name="youtubePrivacy" type="hidden" value="" />
        )}

        {tiktokIsEnabled && tiktokIsUsable ? (
          <section className="mb-4 rounded-xs border border-gray-400 border-r-black border-b-black bg-gray-100 p-2">
            <h4 className="mb-2 font-semibold">TikTok Settings</h4>
            <p className="mb-4 text-sm">
              <strong>Posting as:</strong>{" "}
              <a
                className="text-blue-600 underline"
                href={`https://www.tiktok.com/@${postPlatforms.tiktok.accounts[0].username}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                @{postPlatforms.tiktok.accounts[0].username}
              </a>
            </p>

            <Form.Field
              className="flex flex-col"
              key="tiktokPrivacy"
              name="tiktokPrivacy"
            >
              <Form.Label className="mb-2 font-semibold">
                Who can view this video
              </Form.Label>
              <Form.Control
                asChild
                className="w-full rounded-xs text-black"
                disabled={isFormDisabled}
                required
                title="TikTok Privacy"
                value={state.tiktokPrivacy}
              >
                <select
                  onInput={(e: ChangeEvent<HTMLSelectElement>) =>
                    setState((prev) => ({
                      ...prev,
                      tiktokPrivacy: e.target.value,
                    }))
                  }
                >
                  <option key="none" value="">
                    Select TikTok Privacy Status
                  </option>
                  {tiktokPrivacyOptions.map((option) => (
                    <option
                      disabled={
                        option.value === "SELF_ONLY" &&
                        state.tiktokDiscloseBrandOther
                      }
                      key={option.value}
                      title={
                        option.value === "SELF_ONLY" &&
                        state.tiktokDiscloseBrandOther
                          ? "Branded content visibility cannot be set to private."
                          : ""
                      }
                      value={option.value}
                    >
                      {option.label}{" "}
                      {option.value === "SELF_ONLY" &&
                      state.tiktokDiscloseBrandOther
                        ? "(Branded content cannot be private)"
                        : ""}
                    </option>
                  ))}
                </select>
              </Form.Control>
              <div>
                <Form.Message match="valueMissing">
                  Missing TikTok Privacy Status.
                </Form.Message>
              </div>
            </Form.Field>

            {canTiktokComment || canTiktokDuet || canTiktokStitch ? (
              <section className="mt-4 rounded-xs border border-gray-400 border-r-black border-b-black bg-gray-200 p-2">
                <h4 className="mb-2 font-semibold">Allow users to</h4>
                <div className="flex gap-8">
                  <Form.Field
                    className="flex flex-row items-center gap-2 data-[disabled=true]:opacity-50"
                    data-disabled={!canTiktokComment}
                    key="tiktokComment"
                    name="tiktokComment"
                  >
                    <Form.Control asChild>
                      <input
                        checked={state.tiktokComment}
                        className="h-4 w-4 rounded"
                        disabled={isFormDisabled || !canTiktokComment}
                        id="tiktokComment"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setState((prev) => ({
                            ...prev,
                            tiktokComment: e.target.checked,
                          }))
                        }
                        type="checkbox"
                        value="1"
                      />
                    </Form.Control>
                    <Form.Label
                      className="cursor-pointer"
                      htmlFor="tiktokComment"
                    >
                      Comment
                    </Form.Label>
                  </Form.Field>

                  <Form.Field
                    className="flex flex-row items-center gap-2 data-[disabled=true]:opacity-50"
                    data-disabled={!canTiktokDuet}
                    key="tiktokDuet"
                    name="tiktokDuet"
                  >
                    <Form.Control asChild>
                      <input
                        checked={state.tiktokDuet}
                        className="h-4 w-4 rounded"
                        disabled={isFormDisabled || !canTiktokDuet}
                        id="tiktokDuet"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setState((prev) => ({
                            ...prev,
                            tiktokDuet: e.target.checked,
                          }))
                        }
                        type="checkbox"
                        value="1"
                      />
                    </Form.Control>
                    <Form.Label className="cursor-pointer" htmlFor="tiktokDuet">
                      Duet
                    </Form.Label>
                  </Form.Field>

                  <Form.Field
                    className="flex flex-row items-center gap-2 data-[disabled=true]:opacity-50"
                    data-disabled={!canTiktokStitch}
                    key="tiktokStitch"
                    name="tiktokStitch"
                  >
                    <Form.Control asChild>
                      <input
                        checked={state.tiktokStitch}
                        className="h-4 w-4 rounded"
                        disabled={isFormDisabled || !canTiktokStitch}
                        id="tiktokStitch"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setState((prev) => ({
                            ...prev,
                            tiktokStitch: e.target.checked,
                          }))
                        }
                        type="checkbox"
                        value="1"
                      />
                    </Form.Control>
                    <Form.Label
                      className="cursor-pointer"
                      htmlFor="tiktokStitch"
                    >
                      Stitch
                    </Form.Label>
                  </Form.Field>
                </div>
              </section>
            ) : (
              <>
                <input name="tiktokComment" type="hidden" value="0" />
                <input name="tiktokDuet" type="hidden" value="0" />
                <input name="tiktokStitch" type="hidden" value="0" />
              </>
            )}

            <section>
              <div>
                <div className="mt-4 rounded-xs border border-gray-400 border-r-black border-b-black bg-gray-200 p-2">
                  <Form.Field
                    className="mb-1 flex flex-row items-center gap-2"
                    key="tiktokDisclose"
                    name="tiktokDisclose"
                  >
                    <Form.Control asChild>
                      <input
                        checked={state.tiktokDisclose}
                        className="h-4 w-4 rounded"
                        disabled={isFormDisabled}
                        id="tiktokDisclose"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setState((prev) => ({
                            ...prev,
                            tiktokDisclose: e.target.checked,
                          }))
                        }
                        type="checkbox"
                        value="1"
                      />
                    </Form.Control>
                    <Form.Label
                      className="cursor-pointer font-semibold"
                      htmlFor="tiktokDisclose"
                    >
                      Disclose video content
                    </Form.Label>
                  </Form.Field>
                  <p className="text-sm">
                    Turn on to disclose that this video promotes goods or
                    services in exchange for something of value. Your video
                    could promote yourself, a third party, or both.
                  </p>
                </div>

                {state.tiktokDisclose ? (
                  <div className="mt-4 rounded-xs border border-gray-400 border-r-black border-b-black bg-gray-200 p-2">
                    <Form.Field
                      className="mb-1 flex flex-row items-center gap-2"
                      key="tiktokDiscloseBrandSelf"
                      name="tiktokDiscloseBrandSelf"
                    >
                      <Form.Control asChild>
                        <input
                          checked={state.tiktokDiscloseBrandSelf}
                          className="h-4 w-4 rounded"
                          disabled={isFormDisabled}
                          id="tiktokDiscloseBrandSelf"
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setState((prev) => ({
                              ...prev,
                              tiktokDiscloseBrandSelf: e.target.checked,
                            }))
                          }
                          type="checkbox"
                          value="1"
                        />
                      </Form.Control>
                      <Form.Label
                        className="cursor-pointer font-semibold"
                        htmlFor="tiktokDiscloseBrandSelf"
                      >
                        Your brand
                      </Form.Label>
                    </Form.Field>
                    <p className="text-sm">
                      You are promoting yourself or your own business. This
                      video will be classified as Brand Organic.
                    </p>
                  </div>
                ) : (
                  <input
                    name="tiktokDiscloseBrandSelf"
                    type="hidden"
                    value="0"
                  />
                )}

                {state.tiktokDisclose ? (
                  <div className="mt-4 rounded-xs border border-gray-400 border-r-black border-b-black bg-gray-200 p-2">
                    <Form.Field
                      className="mb-1 flex flex-row items-center gap-2 data-[disabled=true]:opacity-50"
                      data-disabled={state.tiktokPrivacy === "SELF_ONLY"}
                      key="tiktokDiscloseBrandOther"
                      name="tiktokDiscloseBrandOther"
                    >
                      <Form.Control asChild>
                        <input
                          checked={state.tiktokDiscloseBrandOther}
                          className="h-4 w-4 rounded"
                          disabled={
                            isFormDisabled ||
                            state.tiktokPrivacy === "SELF_ONLY"
                          }
                          id="tiktokDiscloseBrandOther"
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setState((prev) => ({
                              ...prev,
                              tiktokDiscloseBrandOther: e.target.checked,
                            }))
                          }
                          type="checkbox"
                          value="1"
                        />
                      </Form.Control>
                      <Form.Label
                        className="cursor-pointer font-semibold"
                        htmlFor="tiktokDiscloseBrandOther"
                      >
                        Branded content
                      </Form.Label>
                    </Form.Field>
                    {state.tiktokPrivacy === "SELF_ONLY" ? (
                      <div className="mb-2 flex items-start gap-3 rounded-xs border border-gray-400 border-r-black border-b-black bg-blue-200 p-2 pl-3 text-sm">
                        <div>
                          <FaCircleExclamation className="size-5 text-blue-600" />
                        </div>
                        <p className="text-sm">
                          Branded content is not available for content with a
                          privacy setting of &quot;Only You&quot;. To post
                          branded content, please select &quot;Friends&quot; or
                          &quot;Followers&quot; in the privacy settings above.
                        </p>
                      </div>
                    ) : null}
                    <p className="text-sm">
                      You are promoting another brand or a third party. This
                      video will be classified as Branded Content.
                    </p>
                  </div>
                ) : (
                  <input
                    name="tiktokDiscloseBrandOther"
                    type="hidden"
                    value="0"
                  />
                )}
              </div>
            </section>

            {state.tiktokDiscloseBrandOther ? (
              <div className="mt-4 mb-2 flex items-start gap-3 rounded-xs border border-gray-400 border-r-black border-b-black bg-blue-200 p-2 pl-3 text-sm">
                <div>
                  <FaCircleExclamation className="size-5 text-blue-600" />
                </div>
                <p>
                  Your photo/video will be labeled &quot;Promotional
                  content&quot;.
                </p>
              </div>
            ) : null}

            {state.tiktokDiscloseBrandSelf &&
            !state.tiktokDiscloseBrandOther ? (
              <div className="mt-4 mb-2 flex items-start gap-3 rounded-xs border border-gray-400 border-r-black border-b-black bg-blue-200 p-2 pl-3 text-sm">
                <div>
                  <FaCircleExclamation className="size-5 text-blue-600" />
                </div>
                <p>
                  Your photo/video will be labeled &quot;Paid partnership&quot;.
                </p>
              </div>
            ) : null}

            {state.tiktokDisclose && state.tiktokDiscloseBrandOther ? (
              <p className="mt-4 rounded-xs border border-gray-400 border-r-black border-b-black bg-gray-200 p-2 text-sm">
                By posting, you agree to TikTok&apos;s{" "}
                <Link
                  className="text-blue-800 underline"
                  href="https://www.tiktok.com/legal/page/global/bc-policy/en"
                  target="_blank"
                >
                  Branded Content Policy
                </Link>{" "}
                and{" "}
                <Link
                  className="text-blue-800 underline"
                  href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en"
                  target="_blank"
                >
                  Music Usage Confirmation
                </Link>
                .
              </p>
            ) : (
              <p className="mt-4 rounded-xs border border-gray-400 border-r-black border-b-black bg-gray-200 p-2 text-sm">
                By posting, you agree to TikTok&apos;s{" "}
                <Link
                  className="text-blue-800 underline"
                  href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en"
                  target="_blank"
                >
                  Music Usage Confirmation
                </Link>
                .
              </p>
            )}
          </section>
        ) : (
          <>
            <input name="tiktokPrivacy" type="hidden" value="" />
            <input name="tiktokComment" type="hidden" value="0" />
            <input name="tiktokDuet" type="hidden" value="0" />
            <input name="tiktokStitch" type="hidden" value="0" />
            <input name="tiktokDisclose" type="hidden" value="0" />
            <input name="tiktokDiscloseBrandSelf" type="hidden" value="0" />
            <input name="tiktokDiscloseBrandOther" type="hidden" value="0" />
          </>
        )}

        {isVideoConverting ? (
          <div className="mb-4 rounded-xs bg-gray-500 p-3 text-white">
            <div className="flex items-center gap-2">
              <Spinner />
              {videoConversionStatus}
            </div>
            <div className="mt-2">
              <div className="h-2 w-full rounded-xs bg-gray-600">
                <div
                  className="h-2 rounded-xs bg-yellow-600 transition-all duration-300"
                  style={{ width: `${videoConversionProgress}%` }}
                />
              </div>
              <div className="mt-1 text-center text-sm">
                {videoConversionProgress}% complete
              </div>
            </div>
          </div>
        ) : null}

        {isVideoTrimming ? (
          <div className="mb-4 rounded-xs bg-gray-500 p-3 text-white">
            <div className="flex items-center gap-2">
              <Spinner />
              {videoTrimStatus}
            </div>
            <div className="mt-2">
              <div className="h-2 w-full rounded-xs bg-gray-600">
                <div
                  className="h-2 rounded-xs bg-yellow-600 transition-all duration-300"
                  style={{ width: `${videoTrimProgress}%` }}
                />
              </div>
              <div className="mt-1 text-center text-sm">
                {videoTrimProgress}% complete
              </div>
            </div>
          </div>
        ) : null}

        {isHLSConverting ? (
          <div className="mb-4 rounded-xs bg-gray-500 p-3 text-white">
            <div className="flex items-center gap-2">
              <Spinner />
              {hlsConversionStatus}
            </div>
            <div className="mt-2">
              <div className="h-2 w-full rounded-xs bg-gray-600">
                <div
                  className="h-2 rounded-xs bg-yellow-600 transition-all duration-300"
                  style={{ width: `${hlsConversionProgress}%` }}
                />
              </div>
              <div className="mt-1 text-center text-sm">
                {hlsConversionProgress}% complete
              </div>
            </div>
          </div>
        ) : null}

        {isStoring ? (
          <div className="mb-4 rounded-xs bg-gray-500 p-3 text-white">
            <div className="flex items-center gap-2">
              <Spinner />
              Uploading videos to storage...
            </div>
          </div>
        ) : null}

        {isPosting ? (
          <div className="mb-4 rounded-xs bg-gray-500 p-3 text-white">
            <div className="flex items-center gap-2">
              <Spinner />
              Submitting posts to services...
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="mb-4 rounded-xs bg-red-800 p-2 text-center text-white">
            {error}
          </p>
        ) : null}

        {hasPostPlatform ? null : (
          <p className="mb-4 rounded-xs bg-red-800 p-2 text-center text-white">
            You must enable at least one posting service.
          </p>
        )}

        {hasStoragePlatform ? null : (
          <p className="mb-4 rounded-xs bg-red-800 p-2 text-center text-white">
            You must enable at least one storage service.
          </p>
        )}

        {hasUnauthorizedPostServices || hasUnauthorizedStorageServices ? (
          <>
            <ModalOverlay />
            <div className="absolute top-0 right-0 bottom-0 left-0 z-20">
              {hasUnauthorizedPostServices ? (
                <div className="mb-4 space-y-4 rounded-xs border border-gray-400 border-r-black border-b-black bg-white p-2 text-black shadow-lg">
                  <div className="text-center font-bold">
                    <p>Some posting services are not authorized.</p>
                    <p>Finish authorizing them before posting.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {unauthorizedPostServices.map((service) => (
                      <ServiceAuthorizeButton
                        authorize={service.authorize}
                        hasAuthorizationStep={service.hasAuthorizationStep}
                        icon={service.icon}
                        isComplete={service.isComplete}
                        key={service.id}
                        label={service.label}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {hasUnauthorizedStorageServices ? (
                <div className="mb-4 space-y-4 rounded-xs border border-gray-400 border-r-black border-b-black bg-white p-2 text-black shadow-lg">
                  <div className="text-center font-bold">
                    <p>Some storage services are not configured.</p>
                    <p>Finish configuring them before posting.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {unauthorizedStorageServices.map((service) => (
                      <ServiceAuthorizeButton
                        authorize={service.authorize}
                        hasAuthorizationStep={service.hasAuthorizationStep}
                        icon={service.icon}
                        isComplete={service.isComplete}
                        key={service.id}
                        label={service.label}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        {hasIncompleteTikTokDisclosure ? (
          <div className="mb-4 flex items-start gap-3 rounded-xs border border-gray-400 border-r-black border-b-black bg-red-200 p-2 pl-3 text-sm">
            <div>
              <FaCircleExclamation className="size-5 text-red-600" />
            </div>
            <p>
              You need to indicate if your content promotes yourself, a third
              party, or both.
            </p>
          </div>
        ) : null}

        <Form.Submit
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xs bg-black px-2 py-3 text-white enabled:hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isFormDisabled || hasIncompleteTikTokDisclosure}
          title={
            hasIncompleteTikTokDisclosure
              ? "You need to indicate if your content promotes yourself, a third party, or both."
              : "Create Post"
          }
        >
          {isPending ? <Spinner /> : null}
          {isPending ? "Posting..." : "Create Post"}
        </Form.Submit>
      </Form.Root>
    </div>
  );
}

export { PostForm };
