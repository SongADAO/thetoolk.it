import { ReactNode } from "react";

interface Props {
  authorize: () => void;
  icon: ReactNode;
  isAuthorized: boolean;
  isComplete: boolean;
  isEnabled: boolean;
  label: string;
}

function ServiceAuthorize({
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
    <button onClick={authorize} type="button">
      {isAuthorized ? "Reauthorize" : "Authorize"} {label} {icon}
    </button>
  );
}

export { ServiceAuthorize };
