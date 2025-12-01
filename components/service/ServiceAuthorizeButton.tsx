import { ReactNode } from "react";
import { FaCircleExclamation } from "react-icons/fa6";

interface Props {
  authorize: () => void;
  hasAuthorizationStep: boolean;
  icon: ReactNode;
  isComplete: boolean;
  label: string;
}

function ServiceAuthorizeButton({
  authorize,
  hasAuthorizationStep,
  icon,
  isComplete,
  label,
}: Readonly<Props>) {
  if (!hasAuthorizationStep || !isComplete) {
    return (
      <div className="relative z-20 flex h-full w-full items-center justify-between gap-2 border border-gray-400 border-r-black border-b-black bg-red-800 p-2 text-white 2xl:py-3.5">
        <div>{icon}</div>
        <div className="flex-1 text-left text-xs leading-none">
          <p>Not configured</p>
          <p>{label}</p>
        </div>
        <div>
          <FaCircleExclamation className="size-4" />
        </div>
      </div>
    );
  }

  return (
    <button
      className="relative z-20 flex h-full w-full cursor-pointer items-center justify-between gap-2 border border-gray-400 border-r-black border-b-black bg-red-800 p-2 text-white hover:bg-gray-900 hover:text-white 2xl:py-3.5"
      onClick={authorize}
      type="button"
    >
      <div>{icon}</div>
      <div className="flex-1 text-left text-xs leading-none">
        <p>Not authorized</p>
        <p>Log in with {label}</p>
      </div>
      <div>
        <FaCircleExclamation className="size-4" />
      </div>
    </button>
  );
}

export { ServiceAuthorizeButton };
