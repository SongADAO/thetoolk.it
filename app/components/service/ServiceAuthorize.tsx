import { ReactNode } from "react";

interface Props {
  authorizationExpiresAt: string;
  authorize: () => void;
  icon: ReactNode;
  isAuthorized: boolean;
  isComplete: boolean;
  isEnabled: boolean;
  label: string;
}

function ServiceAuthorize({
  authorizationExpiresAt,
  authorize,
  icon,
  isAuthorized,
  isComplete,
  isEnabled,
  label,
}: Readonly<Props>) {
  if (!isComplete || !isEnabled) {
    return null;
  }

  return (
    <div>
      <button
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-[#080] px-2 py-2 text-white data-[authorized]:bg-gray-500"
        data-authorized={isAuthorized}
        onClick={authorize}
        type="button"
      >
        {isAuthorized ? "Reauthorize" : "Authorize"} {icon} {label}
      </button>
      {isAuthorized && authorizationExpiresAt ? (
        <div className="text-center text-sm">
          Authorization Expires:{" "}
          {new Date(authorizationExpiresAt).toLocaleString()}
        </div>
      ) : null}
    </div>
  );
}

export { ServiceAuthorize };
