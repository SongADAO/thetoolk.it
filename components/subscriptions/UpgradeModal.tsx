"use client";

import { use } from "react";

import { UserSubscription } from "@/components/account/UserSubscription";
import { LinkButton } from "@/components/general/LinkButton";
import { ModalOverlay } from "@/components/general/ModalOverlay";
import { AuthContext } from "@/contexts/AuthContext";

function UpgradeModal() {
  const { user, loading, subscriptionIsLoading, subscription } =
    use(AuthContext);

  if (loading || subscriptionIsLoading) {
    return (
      <div>
        <ModalOverlay />
      </div>
    );
  }

  if (user && subscription?.status === "active") {
    return null;
  }

  if (!user) {
    return (
      <div>
        <ModalOverlay />
        <div className="absolute top-1/4 left-1/2 z-20 w-[90%] max-w-xl -translate-x-1/2 -translate-y-1/2 transform rounded-md border-2 border-gray-500 bg-gray-200 p-6 shadow-lg">
          <div>
            <h3 className="mb-4 text-center font-bold">TheToolk.it Pro</h3>
            <p className="mb-4 text-center">
              Post videos to all your favorite social networks from one place.
            </p>
            <p className="mb-4 text-center">
              TheToolk.it Pro offers all the sharing features of our free
              version, but without the headache of creating your own API
              credentials.
            </p>
            <p className="flex flex-col items-center justify-center gap-4 text-center md:flex-row">
              <LinkButton href="/auth/signup" width="full">
                Create an Account
              </LinkButton>
              <LinkButton href="/auth/signin" width="full">
                Sign In
              </LinkButton>
            </p>
          </div>

          {/* <div className="mt-10">
            <p className="mb-4 text-center">Not ready to subscribe?</p>
            <p className="text-center">
              <LinkButton href="/free">Try TheToolk.it Free Edition</LinkButton>
            </p>
          </div> */}
        </div>
      </div>
    );
  }

  return (
    <div>
      <ModalOverlay />
      <div className="absolute top-1/4 left-1/2 z-20 w-[90%] max-w-xl -translate-x-1/2 -translate-y-1/2 transform rounded-md border-2 border-gray-500 bg-white shadow-lg contain-paint">
        <div>
          <UserSubscription />
        </div>
      </div>
    </div>
  );
}

export { UpgradeModal };
