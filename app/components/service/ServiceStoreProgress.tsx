import { ReactNode } from "react";
import { FaCheck, FaCircleExclamation } from "react-icons/fa6";

import { Spinner } from "@/app/components/Spinner";

interface Props {
  brandColor: string;
  icon: ReactNode;
  isEnabled: boolean;
  isStoring: boolean;
  label: string;
  storeError: string;
  storeProgress: number;
  storeStatus: string;
}

function ServiceStoreProgress({
  brandColor,
  icon,
  isEnabled,
  isStoring,
  label,
  storeError,
  storeProgress,
  storeStatus,
}: Readonly<Props>) {
  if (!isEnabled) {
    return null;
  }

  // if (!isStoring && !storeStatus && !storeError) {
  //   return null;
  // }

  // storeProgress = 24;
  // isStoring = true;
  // storeStatus =
  //   "asdf asdf asd fas dfa asdf asdf asd fas dfa asdf asdf asd fas dfa ";
  // "asdf asdf asd fas dfa asdf as dfa ";

  // storeProgress = 100;
  // isStoring = false;

  // storeError = "asdfgasdfasfa";
  // isStoring = false;

  const showProgress = !storeError;

  const hasError = Boolean(storeError);

  const isComplete = !storeError && storeStatus && storeProgress === 100;

  return (
    <div
      className={`group relative rounded text-brand-${brandColor}-inverse order-0 bg-[#6c7281] contain-paint data-[has-error=true]:order-1 data-[has-error=true]:bg-red-800 data-[is-complete=true]:order-2 data-[is-complete=true]:bg-green-800`}
      data-has-error={hasError ? "true" : "false"}
      data-is-complete={isComplete ? "true" : "false"}
    >
      {showProgress ? (
        <div
          className={`absolute z-10 h-full w-[0] bg-brand-${brandColor}`}
          style={{ width: `${storeProgress}%` }}
        >
          &nbsp;
        </div>
      ) : null}

      <div className="relative z-20 flex items-center justify-between gap-2 p-2">
        <div>{icon}</div>

        <div className="flex-1 text-left text-xs leading-[1]">
          {storeError ? <p>{storeError}</p> : null}

          {!storeError && storeStatus ? <p>{storeStatus}</p> : null}

          {!storeError && !storeStatus ? <p>{label}</p> : null}
        </div>

        <div>
          {isStoring ? <Spinner /> : null}

          {!isStoring && storeError ? (
            <FaCircleExclamation className="size-6" />
          ) : null}

          {!isStoring && !storeError && storeStatus ? (
            <FaCheck className="size-4" />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { ServiceStoreProgress };
