"use client";

import { use } from "react";

import { Box } from "@/components/general/Box";
import { BoxHeader } from "@/components/general/BoxHeader";
import { BoxMain } from "@/components/general/BoxMain";
import { ManageSubscriptionButton } from "@/components/subscriptions/ManageSubscriptionButton";
import { SubscribeButton } from "@/components/subscriptions/SubscribeButton";
import { AuthContext } from "@/contexts/AuthContext";
import { getPriceName } from "@/lib/subscriptions";

function UserSubscription() {
  const { user, isLoading, subscriptionIsLoading, subscription } =
    use(AuthContext);

  if (isLoading || subscriptionIsLoading) {
    return <div className="p-4 text-center">Loading subscription data...</div>;
  }

  if (!user) {
    return (
      <div className="p-4 text-center">
        Please sign in to manage your subscription.
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="p-4 text-center">Loading subscription details...</div>
    );
  }

  if (subscription.status === "active") {
    return (
      <Box>
        <BoxHeader>
          <h2 className="font-bold">Current Subscription</h2>
        </BoxHeader>
        <BoxMain>
          <div className="space-y-4">
            <div className="space-y-2">
              <p>
                <strong>Plan:</strong> TheToolk.it Pro
              </p>
              {subscription.price_type ? (
                <p>
                  <strong>Price:</strong>{" "}
                  {getPriceName(subscription.price_type)}
                </p>
              ) : null}
              <p>
                <strong>Status:</strong>{" "}
                <span className="capitalize">{subscription.status}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ManageSubscriptionButton />
            </div>
          </div>
        </BoxMain>
      </Box>
    );
  }

  return (
    <Box>
      <BoxHeader>
        <h2 className="font-bold">Subscribe to TheToolk.it Pro</h2>
      </BoxHeader>
      <BoxMain>
        <div className="space-y-4">
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
          <section className="space-y-2">
            <header>
              <h3 className="font-bold">Choose Your Price</h3>
            </header>
            <div className="mt-4 flex items-center gap-4">
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
        </div>
      </BoxMain>
    </Box>
  );
}

export { UserSubscription };
