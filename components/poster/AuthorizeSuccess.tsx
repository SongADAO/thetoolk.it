"use client";

function AuthorizeSuccess() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        {/* <h1 className="mb-8 flex flex-col items-center justify-center gap-2 text-xl">
          {icon} {label}
        </h1> */}
        <p className="">Authorization Complete</p>
        <div className="flex items-center justify-center">
          <button
            className="mt-4 cursor-pointer rounded-sm bg-gray-500 px-4 py-2 text-white"
            onClick={() => window.close()}
            type="button"
          >
            Return to TheToolk.it
          </button>
        </div>
      </div>
    </div>
  );
}

export { AuthorizeSuccess };
