"use client";

import { use } from "react";

import { ManageSubscriptionButton } from "@/components/ManageSubscriptionButton";
import { SubscribeButton } from "@/components/SubscribeButton";
import { AuthContext } from "@/contexts/AuthContext";
import { getPriceName } from "@/lib/subscriptions";

function SubscriptionManager() {
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

  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end)
    : null;

  if (subscription.status === "active") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-8 p-4">
        <h2 className="text-center text-xl font-bold">
          Your TheToolk.it Pro Subscription
        </h2>
        <div>
          {subscription.price_type ? (
            <div>
              <strong>Plan: {getPriceName(subscription.price_type)}</strong>
            </div>
          ) : null}
          <div>
            <strong>
              Status: <span className="capitalize">{subscription.status}</span>
            </strong>
          </div>
          {currentPeriodEnd ? (
            <div>
              <strong>Renewal: {currentPeriodEnd.toLocaleDateString()}</strong>
            </div>
          ) : null}
        </div>
        <div>
          <ManageSubscriptionButton />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
        <h2 className="text-center text-xl font-bold">
          Subscribe to TheToolk.it Pro
        </h2>
        <h3 className="pt-4 text-center font-bold">Features</h3>
        <ul className="text-center">
          <li>No API setup required</li>
          <li>Ability to post to TikTok</li>
          <li>Easily use the same accounts across devices</li>
        </ul>
        <div className="flex items-center justify-center gap-4 pt-8">
          <SubscribeButton label={getPriceName("pro-month")} type="pro-month" />
          <SubscribeButton label={getPriceName("pro-year")} type="pro-year" />
        </div>
      </div>
    </div>
  );
}

export { SubscriptionManager };
