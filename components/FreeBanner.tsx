// "use client";

import Link from "next/link";
// import { use } from "react";

// import { AuthContext } from "@/contexts/AuthContext";

function FreeBanner() {
  // const { isAuthenticated } = use(AuthContext);

  return (
    <div className="bg-yellow-100 p-4 text-center">
      {/* {isAuthenticated ? (
        <p>
          You&apos;re using TheToolk.it{" "}
          <strong className="font-semibold">Free Edition</strong>.{" "}
          <Link className="underline" href="/subscribe">
            Subscribe
          </Link>{" "}
          to unlock Pro features.{" "}
        </p>
      ) : (
        <p>
          You&apos;re using TheToolk.it{" "}
          <strong className="font-semibold">Free Edition</strong>.{" "}
          <Link className="underline" href="/auth/signup">
            Create an Account and Subscribe
          </Link>{" "}
          to unlock Pro features.{" "}
        </p>
      )} */}

      <p>
        You&apos;re using TheToolk.it{" "}
        <strong className="font-semibold">Free Edition</strong>.{" "}
        <Link className="underline" href="/pro">
          Switch to TheToolk.it Pro
        </Link>{" "}
        to unlock Pro features.{" "}
      </p>
    </div>
  );
}

export { FreeBanner };
