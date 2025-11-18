import { ReactNode } from "react";
import { FaCheck, FaCircleExclamation } from "react-icons/fa6";

import { Spinner } from "@/components/Spinner";

interface Props {
  brandColor: string;
  icon: ReactNode;
  isUsable: boolean;
  isEnabled: boolean;
  isProcessing: boolean;
  label: string;
  processError: string;
  processProgress: number;
  processStatus: string;
}

function ServiceProgress({
  brandColor,
  icon,
  isUsable,
  isEnabled,
  isProcessing,
  label,
  processError,
  processProgress,
  processStatus,
}: Readonly<Props>) {
  if (!isEnabled) {
    return null;
  }

  const showProgress = !processError && processProgress !== 100;

  const hasError = Boolean(processError) || !isUsable;

  const isComplete = !processError && processStatus && processProgress === 100;

  return (
    <div
      className={`group relative rounded text-brand-${brandColor}-inverse bg-[#6c7281] contain-paint data-[has-error=true]:bg-red-800 data-[is-complete=true]:bg-green-800`}
      data-has-error={hasError ? "true" : "false"}
      data-is-complete={isComplete ? "true" : "false"}
    >
      {showProgress ? (
        <div
          className={`absolute z-10 h-full w-0 bg-brand-${brandColor}`}
          style={{ width: `${processProgress}%` }}
        >
          &nbsp;
        </div>
      ) : null}

      <div className="relative z-20 flex items-center justify-between gap-2 p-2 2xl:py-3.5">
        <div>{icon}</div>

        <div className="flex-1 text-left text-xs leading-none">
          {processError ? <p>{processError}</p> : null}

          {!processError && processStatus ? <p>{processStatus}</p> : null}

          {!processError && !processStatus ? <p>{label}</p> : null}

          {isUsable ? null : <p>Not authorized</p>}
        </div>

        <div>
          {isProcessing ? <Spinner /> : null}

          {!isProcessing && (processError || !isUsable) ? (
            <FaCircleExclamation className="size-6" />
          ) : null}

          {!isProcessing && !processError && processStatus ? (
            <FaCheck className="size-4" />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { ServiceProgress };
