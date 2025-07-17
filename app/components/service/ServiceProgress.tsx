import { ReactNode } from "react";
import { FaCheck, FaCircleExclamation } from "react-icons/fa6";

import { Spinner } from "@/app/components/Spinner";

interface Props {
  brandColor: string;
  icon: ReactNode;
  isEnabled: boolean;
  isProcessing: boolean;
  label: string;
  error: string;
  progress: number;
  status: string;
}

function ServiceProgress({
  brandColor,
  icon,
  isEnabled,
  isProcessing,
  label,
  error,
  progress,
  status,
}: Readonly<Props>) {
  if (!isEnabled) {
    return null;
  }

  // if (!isProcessing && !status && !error) {
  //   return null;
  // }

  // progress = 24;
  // isProcessing = true;
  // status =
  //   "asdf asdf asd fas dfa asdf asdf asd fas dfa asdf asdf asd fas dfa ";
  // "asdf asdf asd fas dfa asdf as dfa ";

  // progress = 100;
  // isProcessing = false;

  // error = "asdfgasdfasfa";
  // isProcessing = false;

  const showProgress = !error;

  const hasError = Boolean(error);

  const isComplete = !error && status && progress === 100;

  return (
    <div
      className={`group relative rounded text-brand-${brandColor}-inverse order-0 bg-[#6c7281] contain-paint data-[has-error=true]:order-1 data-[has-error=true]:bg-red-800 data-[is-complete=true]:order-2 data-[is-complete=true]:bg-green-800 2xl:p-1.5`}
      data-has-error={hasError ? "true" : "false"}
      data-is-complete={isComplete ? "true" : "false"}
    >
      {showProgress ? (
        <div
          className={`absolute z-10 h-full w-[0] bg-brand-${brandColor}`}
          style={{ width: `${progress}%` }}
        >
          &nbsp;
        </div>
      ) : null}

      <div className="relative z-20 flex items-center justify-between gap-2 p-2">
        <div>{icon}</div>

        <div className="flex-1 text-left text-xs leading-[1]">
          {error ? <p>{error}</p> : null}

          {!error && status ? <p>{status}</p> : null}

          {!error && !status ? <p>{label}</p> : null}
        </div>

        <div>
          {isProcessing ? <Spinner /> : null}

          {!isProcessing && error ? (
            <FaCircleExclamation className="size-6" />
          ) : null}

          {!isProcessing && !error && status ? (
            <FaCheck className="size-4" />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { ServiceProgress };
