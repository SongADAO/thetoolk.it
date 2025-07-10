import { ReactNode } from "react";

interface Props {
  brandColor: string;
  icon: ReactNode;
  isPosting: boolean;
  label: string;
  postError: string;
  postProgress: number;
  postStatus: string;
}

function ServiceProgress({
  brandColor,
  icon,
  isPosting,
  label,
  postError,
  postProgress,
  postStatus,
}: Readonly<Props>) {
  // if (!isPosting && !postStatus && !postError) {
  //   return null;
  // }

  return (
    <div>
      <div
        className={`group flex gap-2 rounded bg-gray-300 px-4 py-2 data-[enabled=yes]:text-brand-${brandColor}-inverse data-[enabled=yes]:bg-brand-${brandColor}`}
      >
        {icon} {label}
      </div>

      {postError ? (
        <div className="mt-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {postError}
        </div>
      ) : null}

      {isPosting ? (
        <div className="mt-6 space-y-3">
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${postProgress}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-600">{postStatus}</p>
          {/* <button
            className="w-full rounded bg-red-600 py-2 text-white hover:bg-red-700"
            onClick={cancelPost}
          >
            Cancel Upload
          </button> */}
        </div>
      ) : null}

      {postStatus && !isPosting && postProgress === 100 ? (
        <div className="mt-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
          {postStatus}
        </div>
      ) : null}
    </div>
  );
}

export { ServiceProgress };
