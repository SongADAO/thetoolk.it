"use client";

import Link from "next/link";
import { Form } from "radix-ui";
import { type ChangeEvent, type FormEvent, use, useRef, useState } from "react";
import { FaCircleExclamation } from "react-icons/fa6";

import { Spinner } from "@/components/general/Spinner";
import { CreatePostContext } from "@/contexts/CreatePostContext";
import { formatFileDuration, formatFileSize } from "@/lib/video/video";
// import { BlueskyContext } from "@/services/post/bluesky/Context";
// import { FacebookContext } from "@/services/post/facebook/Context";
// import { InstagramContext } from "@/services/post/instagram/Context";
// import { NeynarContext } from "@/services/post/neynar/Context";
// import { ThreadsContext } from "@/services/post/threads/Context";
import { TiktokContext } from "@/services/post/tiktok/Context";
// import { TwitterContext } from "@/services/post/twitter/Context";
import { YoutubeContext } from "@/services/post/youtube/Context";

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
    tiktokComment: true,
    tiktokDisclose: false,
    tiktokDiscloseBrandOther: false,
    tiktokDiscloseBrandSelf: false,
    tiktokDuet: true,
    tiktokPrivacy: "",
    tiktokStitch: true,
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
  // Post services.
  // const bluesky = use(BlueskyContext);
  // const facebook = use(FacebookContext);
  // const instagram = use(InstagramContext);
  // const neynar = use(NeynarContext);
  // const threads = use(ThreadsContext);
  const tiktok = use(TiktokContext);
  // const twitter = use(TwitterContext);
  const youtube = use(YoutubeContext);

  const {
    canPostToAllServices,
    canStoreToAllServices,
    createPost,
    getVideoInfo,
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

      if (!newFormState.title) {
        throw new Error("Please enter a title.");
      }

      if (!selectedFile) {
        throw new Error("Please select a video file.");
      }

      if (!canPostToAllServices) {
        throw new Error("Some selected posting services are not authorized.");
      }

      if (!canStoreToAllServices) {
        throw new Error("Some selected storage services are not authorized.");
      }

      const videos = await preparePostVideo(selectedFile);

      // const videos = selectedFile
      //   ? await preparePostVideo(selectedFile)
      //   : {
      //       full: {
      //         video: null,
      //         videoHSLUrl: "",
      //         videoUrl: "",
      //       },
      //     };

      // const video = selectedFile;
      // const videoUrl = "https://thetoolkit-test.s3.us-east-1.amazonaws.com/example2.mp4";
      // const videoHSLUrl = "https://songaday.mypinata.cloud/ipfs/bafybeiaf2wbvugi6ijcrphiwjosu4oyoeqsyakhix2ubyxgolzjtysfcua/manifest.m3u8";

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
    isPending || !canPostToAllServices || !canStoreToAllServices;

  const youtubePrivacyOptions = [
    { label: "Private", value: "private" },
    { label: "Public", value: "public" },
    { label: "Unlisted", value: "unlisted" },
  ];

  const allTiktokPrivacyOptions = [
    { label: "Followers", value: "FOLLOWER_OF_CREATOR" },
    {
      label: "Friends (Followers you follow back)",
      value: "MUTUAL_FOLLOW_FRIENDS",
    },
    { label: "Only You", value: "SELF_ONLY" },
  ];

  const tiktokPrivacyOptions = allTiktokPrivacyOptions.filter((option) =>
    tiktok.accounts[0]?.permissions?.privacy_level_options?.includes(
      option.value,
    ),
  );

  const canTiktokComment =
    tiktok.accounts.length &&
    !tiktok.accounts[0]?.permissions?.comment_disabled;
  const canTiktokDuet =
    tiktok.accounts.length && !tiktok.accounts[0]?.permissions?.duet_disabled;
  const canTiktokStitch =
    tiktok.accounts.length && !tiktok.accounts[0]?.permissions?.stitch_disabled;

  // const canTiktokComment = true;
  // const canTiktokDuet = true;
  // const canTiktokStitch = true;

  // const facebookPrivacyOptions = [
  //   { label: "Only Me", value: "SELF" },
  //   { label: "All Friends", value: "ALL_FRIENDS" },
  //   { label: "Public", value: "EVERYONE" },
  // ];

  return (
    <div>
      <Form.Root>
        <Form.Field className="mb-4 flex flex-col" key="video" name="video">
          <Form.Label className="mb-2 font-semibold">Video</Form.Label>
          <Form.Control
            accept="video/mp4"
            autoComplete="off"
            className="w-full rounded border bg-gray-500 p-2 text-white"
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
              className="max-w-full rounded border border-gray-300"
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
        <Form.Field className="mb-4 flex flex-col" key="title" name="title">
          <Form.Label className="mb-2 font-semibold">Title</Form.Label>
          <Form.Control
            autoComplete="off"
            className="w-full rounded text-black"
            disabled={isFormDisabled}
            onChange={(e) =>
              setState((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Title"
            required
            title="Title"
            type="text"
            value={state.title}
          />
          <div>
            <Form.Message match="valueMissing">Missing title.</Form.Message>
          </div>
        </Form.Field>

        <Form.Field className="mb-4 flex flex-col" key="text" name="text">
          <Form.Label className="mb-2 font-semibold">Message</Form.Label>
          <Form.Control
            asChild
            autoComplete="off"
            className="w-full rounded text-black"
            disabled={isFormDisabled}
            onChange={(e) =>
              setState((prev) => ({ ...prev, text: e.target.value }))
            }
            placeholder="Message"
            required
            title="Message"
            value={state.text}
          >
            <textarea rows={6} />
          </Form.Control>
          <div>
            <Form.Message match="valueMissing">Missing message.</Form.Message>
          </div>
        </Form.Field>

        {/* {facebook.isEnabled ? (
          <Form.Field
            className="mb-4 flex flex-col"
            key="facebookPrivacy"
            name="facebookPrivacy"
          >
            <Form.Label className="mb-2 font-semibold">Facebook Privacy Settings</Form.Label>
            <Form.Control
              asChild
              className="w-full rounded text-black"
              disabled={isFormDisabled}
              required
              title="Facebook Privacy"
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
        ) : (
          <Form.Field
            className="mb-4 flex flex-col"
            key="facebookPrivacy"
            name="facebookPrivacy"
          >
            <Form.Control type="hidden" value={state.youtubePrivacy} />
          </Form.Field>
        )} */}

        {youtube.isEnabled ? (
          <section className="mb-4 rounded bg-gray-200 p-2">
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
                className="w-full rounded text-black"
                disabled={isFormDisabled}
                required
                title="YouTube Privacy"
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

        {tiktok.isEnabled ? (
          <section className="mb-4 rounded bg-gray-200 p-2">
            <h4 className="mb-2 font-semibold">TikTok Settings</h4>

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
                className="w-full rounded text-black"
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
                    Select TikTok Privacy Settings
                  </option>
                  {tiktokPrivacyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Form.Control>
              <div>
                <Form.Message match="valueMissing">
                  Missing TikTok Privacy Settings.
                </Form.Message>
              </div>
            </Form.Field>

            {canTiktokComment || canTiktokDuet || canTiktokStitch ? (
              <section className="mt-4 rounded bg-gray-300 p-2">
                <h4 className="mb-2 font-semibold">Allow users to</h4>
                <div className="flex gap-8">
                  {canTiktokComment ? (
                    <Form.Field
                      className="flex flex-row items-center gap-2"
                      key="tiktokComment"
                      name="tiktokComment"
                    >
                      <Form.Control asChild>
                        <input
                          checked={state.tiktokComment}
                          className="h-4 w-4 rounded"
                          disabled={isFormDisabled}
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
                  ) : (
                    <input name="tiktokComment" type="hidden" value="0" />
                  )}

                  {canTiktokDuet ? (
                    <Form.Field
                      className="flex flex-row items-center gap-2"
                      key="tiktokDuet"
                      name="tiktokDuet"
                    >
                      <Form.Control asChild>
                        <input
                          checked={state.tiktokDuet}
                          className="h-4 w-4 rounded"
                          disabled={isFormDisabled}
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
                      <Form.Label
                        className="cursor-pointer"
                        htmlFor="tiktokDuet"
                      >
                        Duet
                      </Form.Label>
                    </Form.Field>
                  ) : (
                    <input name="tiktokDuet" type="hidden" value="0" />
                  )}

                  {canTiktokStitch ? (
                    <Form.Field
                      className="flex flex-row items-center gap-2"
                      key="tiktokStitch"
                      name="tiktokStitch"
                    >
                      <Form.Control asChild>
                        <input
                          checked={state.tiktokStitch}
                          className="h-4 w-4 rounded"
                          disabled={isFormDisabled}
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
                  ) : (
                    <input name="tiktokStitch" type="hidden" value="0" />
                  )}
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
                <div className="mt-4 rounded bg-gray-300 p-2">
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
                  {state.tiktokDisclose ? (
                    <div className="mb-2 flex items-start gap-3 rounded bg-blue-200 p-2 pl-3 text-sm">
                      <div>
                        <FaCircleExclamation className="size-5 text-blue-600" />
                      </div>
                      <p>
                        Your video will be labeled &quot;Promotional
                        content&quot;. This cannot be changed once your video is
                        posted.
                      </p>
                    </div>
                  ) : null}
                  <p className="text-sm">
                    Turn on to disclose that this video promotes goods or
                    services in exchange for something of value. Your video
                    could promote yourself, a third party, or both.
                  </p>
                </div>

                {state.tiktokDisclose ? (
                  <div className="mt-4 rounded bg-gray-300 p-2">
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
                  <div className="mt-4 rounded bg-gray-300 p-2">
                    <Form.Field
                      className="mb-1 flex flex-row items-center gap-2"
                      key="tiktokDiscloseBrandOther"
                      name="tiktokDiscloseBrandOther"
                    >
                      <Form.Control asChild>
                        <input
                          checked={state.tiktokDiscloseBrandOther}
                          className="h-4 w-4 rounded"
                          disabled={isFormDisabled}
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
                    <p className="text-sm">
                      You are promoting another brand or a third party. This
                      video will be classified sa Branded Content.
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

            {state.tiktokDisclose && state.tiktokDiscloseBrandOther ? (
              <p className="mt-4 rounded bg-gray-300 p-2 text-sm">
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
              <p className="mt-4 rounded bg-gray-300 p-2 text-sm">
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
          <div className="mb-4 rounded bg-gray-500 p-3 text-white">
            <div className="flex items-center gap-2">
              <Spinner />
              {videoConversionStatus}
            </div>
            <div className="mt-2">
              <div className="h-2 w-full rounded bg-gray-600">
                <div
                  className="h-2 rounded bg-yellow-600 transition-all duration-300"
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
          <div className="mb-4 rounded bg-gray-500 p-3 text-white">
            <div className="flex items-center gap-2">
              <Spinner />
              {videoTrimStatus}
            </div>
            <div className="mt-2">
              <div className="h-2 w-full rounded bg-gray-600">
                <div
                  className="h-2 rounded bg-yellow-600 transition-all duration-300"
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
          <div className="mb-4 rounded bg-gray-500 p-3 text-white">
            <div className="flex items-center gap-2">
              <Spinner />
              {hlsConversionStatus}
            </div>
            <div className="mt-2">
              <div className="h-2 w-full rounded bg-gray-600">
                <div
                  className="h-2 rounded bg-yellow-600 transition-all duration-300"
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
          <div className="mb-4 rounded bg-gray-500 p-3 text-white">
            <div className="flex items-center gap-2">
              <Spinner />
              Uploading videos to storage...
            </div>
          </div>
        ) : null}

        {isPosting ? (
          <div className="mb-4 rounded bg-gray-500 p-3 text-white">
            <div className="flex items-center gap-2">
              <Spinner />
              Submitting posts to services...
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="mb-4 rounded bg-red-800 p-2 text-center text-white">
            {error}
          </p>
        ) : null}

        {canPostToAllServices ? null : (
          <p className="mb-4 rounded bg-red-800 p-2 text-center text-white">
            Some enabled posting services are not authorized. Finish authorizing
            them before posting.
          </p>
        )}

        {canStoreToAllServices ? null : (
          <p className="mb-4 rounded bg-red-800 p-2 text-center text-white">
            Some enabled storage services are not authorized. Finish authorizing
            them before posting.
          </p>
        )}

        <Form.Submit
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-black px-2 py-3 text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isFormDisabled}
        >
          {isPending ? <Spinner /> : null}
          {isPending ? "Posting..." : "Create Post"}
        </Form.Submit>
      </Form.Root>
    </div>
  );
}

export { PostForm };
