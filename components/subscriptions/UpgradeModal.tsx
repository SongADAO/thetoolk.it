"use client";

import { use } from "react";

import { LinkButton } from "@/components/general/LinkButton";
import { ModalOverlay } from "@/components/general/ModalOverlay";
import { SubscribeButton } from "@/components/subscriptions/SubscribeButton";
import { AuthContext } from "@/contexts/AuthContext";
import { getPriceName } from "@/lib/subscriptions";

function UpgradeModal() {
  const { user, isLoading, subscriptionIsLoading, subscription } =
    use(AuthContext);

  if (isLoading || subscriptionIsLoading) {
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
        <div className="absolute top-[2rem] left-1/2 z-20 w-[90%] max-w-xl -translate-x-1/2 transform rounded-xs border-2 border-gray-500 bg-white p-6 shadow-lg md:top-[4rem]">
          <section className="space-y-4">
            <header>
              <h3 className="text-center font-bold">TheToolk.it Pro</h3>
            </header>
            <p className="text-center">
              Post videos to all your favorite social networks from one place.
            </p>
            <p className="text-center">
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
          </section>

          <div className="mt-10">
            <p className="mb-4 text-center">Not ready to subscribe?</p>
            <p className="text-center">
              <LinkButton href="/free">Try TheToolk.it Free Edition</LinkButton>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ModalOverlay />
      <div className="absolute top-[2rem] left-1/2 z-20 w-[90%] max-w-xl -translate-x-1/2 transform rounded-xs border-2 border-gray-500 bg-white p-6 shadow-lg md:top-[4rem]">
        <section className="space-y-4">
          <header>
            <h3 className="text-center font-bold">
              Subscribe to TheToolk.it Pro
            </h3>
          </header>

          <section className="space-y-2">
            <header>
              <h3 className="font-bold">Pro Features</h3>
            </header>
            <ul className="list-inside list-disc">
              <li>No API setup required</li>
              <li>Ability to post to TikTok</li>
              <li>Easily use the same accounts across devices</li>
            </ul>
          </section>

          <section className="space-y-4 pt-2 text-center">
            <header>
              <h3 className="font-bold">Choose Your Price</h3>
            </header>
            <div className="flex items-center justify-center gap-4">
              <SubscribeButton
                label={getPriceName("pro-month")}
                type="pro-month"
              />
              <SubscribeButton
                label={getPriceName("pro-year")}
                type="pro-year"
              />
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}

export { UpgradeModal };
