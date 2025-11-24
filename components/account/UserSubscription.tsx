"use client";

import { use } from "react";

import { ManageSubscriptionButton } from "@/components/subscriptions/ManageSubscriptionButton";
import { SubscribeButton } from "@/components/subscriptions/SubscribeButton";
import { AuthContext } from "@/contexts/AuthContext";
import { getPriceName } from "@/lib/subscriptions";

function UserSubscription() {
  const { user, loading, subscriptionIsLoading, subscription } =
    use(AuthContext);

  if (loading || subscriptionIsLoading) {
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
      <section className="mx-auto space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">Current Subscription</h2>
        <div className="space-y-2">
          <p>
            <strong>Plan:</strong> TheToolk.it Pro
          </p>
          {subscription.price_type ? (
            <p>
              <strong>Price:</strong> {getPriceName(subscription.price_type)}
            </p>
          ) : null}
          <p>
            <strong>Status:</strong>{" "}
            <span className="capitalize">{subscription.status}</span>
          </p>
        </div>
        <div className="mt-4 flex gap-4">
          <ManageSubscriptionButton />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold">Subscribe to TheToolk.it Pro</h2>
      <section className="space-y-2">
        <h3 className="font-bold">Pro Features</h3>
        <ul className="list-inside list-disc">
          <li>No API setup required</li>
          <li>Ability to post to TikTok</li>
          <li>Easily use the same accounts across devices</li>
        </ul>
      </section>
      <section className="space-y-2">
        <h3 className="font-bold">Choose Your Price</h3>
        <div className="mt-4 flex items-center justify-start gap-4">
          <SubscribeButton label={getPriceName("pro-month")} type="pro-month" />
          <SubscribeButton label={getPriceName("pro-year")} type="pro-year" />
        </div>
      </section>
    </section>
  );
}

export { UserSubscription };
