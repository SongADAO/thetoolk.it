import { ReactNode } from "react";

import { ServiceProgress } from "@/components/service/ServiceProgress";

interface Props {
  brandColor: string;
  icon: ReactNode;
  isEnabled: boolean;
  isPosting: boolean;
  isUsable: boolean;
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
  isUsable,
  label,
  postError,
  postProgress,
  postStatus,
}: Readonly<Props>) {
  return (
    <ServiceProgress
      brandColor={brandColor}
      error={postError}
      icon={icon}
      isEnabled={isEnabled}
      isProcessing={isPosting}
      isUsable={isUsable}
      label={label}
      progress={postProgress}
      status={postStatus}
    />
  );
}

export { ServicePostProgress };
