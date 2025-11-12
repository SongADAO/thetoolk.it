"use client";

import Link from "next/link";
import { use } from "react";

import { SubscriptionManager } from "@/components/SubscriptionManager";
import { UpgradeOverlay } from "@/components/UpgradeOverlay";
import { AuthContext } from "@/contexts/AuthContext";

function UpgradeModal() {
  const { user, loading, subscriptionIsLoading, subscription } =
    use(AuthContext);

  if (loading || subscriptionIsLoading) {
    return (
      <div>
        <UpgradeOverlay />
      </div>
    );
  }

  if (user && subscription?.status === "active") {
    return null;
  }

  if (!user) {
    return (
      <div>
        <UpgradeOverlay />
        <div className="absolute top-1/4 left-1/2 z-20 w-[90%] max-w-xl -translate-x-1/2 -translate-y-1/2 transform rounded-md border-2 border-gray-500 bg-gray-200 p-6 shadow-lg">
          <div>
            <p className="mb-4 text-center">
              Post videos to all your favorite social networks from one place.
            </p>
            <p className="mb-4 text-center">
              TheToolk.it Pro offers all the sharing features of our free
              version, but without the headache of creating your own API
              credentials.
            </p>
            <p className="flex flex-col items-center justify-center gap-4 text-center md:flex-row">
              <Link
                className="w-full cursor-pointer rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
                href="/auth/signup"
              >
                Create an Account
              </Link>
              <Link
                className="w-full cursor-pointer rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
                href="/auth/signin"
              >
                Sign In
              </Link>
            </p>
          </div>

          {/* <div className="mt-10">
            <p className="mb-4 text-center">Not ready to subscribe?</p>
            <p className="text-center">
              <Link
                className="cursor-pointer rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
                href="/free"
              >
                Try TheToolk.it Free Edition
              </Link>
            </p>
          </div> */}
        </div>
      </div>
    );
  }

  return (
    <div>
      <UpgradeOverlay />
      <div className="absolute top-1/4 left-1/2 z-20 w-[90%] max-w-xl -translate-x-1/2 -translate-y-1/2 transform rounded-md border-2 border-gray-500 bg-gray-200 p-6 shadow-lg">
        <div>
          {/* <p className="mb-4 text-center">
            To access TheToolk.it Pro subscribe to one of our plans.
          </p>
          <p className="text-center">
            <Link
              className="w-full cursor-pointer rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
              href="/subscribe"
            >
              Subscribe
            </Link>
          </p> */}

          <SubscriptionManager />
        </div>
      </div>
    </div>
  );
}

export { UpgradeModal };
