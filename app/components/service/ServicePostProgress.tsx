import { ReactNode } from "react";
import { FaCheck, FaCircleExclamation } from "react-icons/fa6";

import { Spinner } from "@/app/components/Spinner";

interface Props {
  brandColor: string;
  icon: ReactNode;
  isEnabled: boolean;
  isPosting: boolean;
  label: string;
  postError: string;
  postProgress: number;
  postStatus: string;
}

function ServicePostProgress({
  brandColor,
  icon,
  isEnabled,
  isPosting,
  label,
  postError,
  postProgress,
  postStatus,
}: Readonly<Props>) {
  if (!isEnabled) {
    return null;
  }

  // if (!isPosting && !postStatus && !postError) {
  //   return null;
  // }

  // postProgress = 24;
  // isPosting = true;
  // postStatus =
  //   "asdf asdf asd fas dfa asdf asdf asd fas dfa asdf asdf asd fas dfa ";
  // "asdf asdf asd fas dfa asdf as dfa ";

  // postProgress = 100;
  // isPosting = false;

  // postError = "asdfgasdfasfa";
  // isPosting = false;

  const showProgress = !postError;

  return (
    <div className="mt-2">
      <div
        className={`group relative rounded text-brand-${brandColor}-inverse bg-[#6c7281] contain-paint data-[has-error=true]:bg-red-800`}
        data-has-error={postError ? "true" : "false"}
      >
        {showProgress ? (
          <div
            className={`absolute z-10 h-full w-[0] bg-brand-${brandColor}`}
            style={{ width: `${postProgress}%` }}
          >
            &nbsp;
          </div>
        ) : null}

        <div className="relative z-20 flex items-center justify-between gap-2 p-2">
          <div>{icon}</div>

          <div className="flex-1 text-left text-xs leading-[1]">
            {postError ? <p>{postError}</p> : null}

            {!postError && postStatus ? <p>{postStatus}</p> : null}

            {!postError && !postStatus ? <p>{label}</p> : null}
          </div>

          <div>
            {isPosting ? <Spinner /> : null}

            {!isPosting && postError ? (
              <FaCircleExclamation className="size-6" />
            ) : null}

            {!isPosting && !postError && postStatus ? (
              <FaCheck className="size-4" />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export { ServicePostProgress };
