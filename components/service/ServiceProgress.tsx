import { ReactNode } from "react";
import { FaCheck, FaCircleExclamation } from "react-icons/fa6";

import { Spinner } from "@/components/general/Spinner";
import { ServiceAuthorizeButton } from "@/components/service/ServiceAuthorizeButton";
import type { PostServiceAccount } from "@/services/post/types";
import type { StorageServiceAccount } from "@/services/storage/types";

interface Props {
  accounts: PostServiceAccount[] | StorageServiceAccount[];
  authorize: () => void;
  brandColor: string;
  hasAuthorizationStep: boolean;
  icon: ReactNode;
  isComplete: boolean;
  isUsable: boolean;
  isEnabled: boolean;
  isProcessing: boolean;
  label: string;
  processError: string;
  processProgress: number;
  processStatus: string;
}

function ServiceProgress({
  accounts,
  authorize,
  brandColor,
  hasAuthorizationStep,
  icon,
  isComplete,
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

  // In Progress
  // isProcessing = true;
  // processProgress = 40;
  // processStatus = "Setting up...";

  // Error
  // processError = "Had an error...";

  // Complete
  // processProgress = 100;
  // processStatus = "Process Complete...";

  const showProgress =
    !processError && processProgress !== 0 && processProgress !== 100;

  const hasError = Boolean(processError) || !isUsable;

  const isProcessComplete =
    !processError && processStatus && processProgress === 100;

  if (!isUsable) {
    return (
      <ServiceAuthorizeButton
        authorize={authorize}
        hasAuthorizationStep={hasAuthorizationStep}
        icon={icon}
        isComplete={isComplete}
        label={label}
      />
    );
  }

  return (
    <div
      className={`group relative rounded-xs border border-gray-400 border-r-black border-b-black bg-gray-100 font-semibold data-[has-error=true]:text-shadow-xs data-[is-complete=true]:text-shadow-xs data-[is-processing=true]:text-shadow-xs text-brand-${brandColor} wrap-anywhere contain-paint data-[has-error=true]:bg-red-800 data-[has-error=true]:text-white data-[is-complete=true]:bg-green-800 data-[is-complete=true]:text-white data-[is-processing=true]:bg-gray-600 data-[is-processing=true]:text-white`}
      data-has-error={hasError ? "true" : "false"}
      data-is-complete={isProcessComplete ? "true" : "false"}
      data-is-processing={showProgress ? "true" : "false"}
    >
      {showProgress ? (
        <div
          className={`absolute z-10 h-full w-0 bg-brand-${brandColor}`}
          style={{ width: `${processProgress}%` }}
        >
          &nbsp;
        </div>
      ) : null}

      <div className="relative z-20 flex h-full items-center justify-between gap-2 p-2 2xl:py-3.5">
        <div>{icon}</div>

        <div className="flex-1 text-left text-xs leading-none">
          {processError ? <p>{processError}</p> : null}

          {!processError && processStatus ? <p>{processStatus}</p> : null}

          {!processError && !processStatus ? (
            <div>
              <p>{label}</p>
              {accounts.map((account) => (
                <div key={account.id}>@{account.username}</div>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          {isProcessing ? <Spinner /> : null}

          {!isProcessing && processError ? (
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
