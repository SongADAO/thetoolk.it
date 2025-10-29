import type { SupabaseClient, User } from "@supabase/supabase-js";

interface Subscription {
  current_period_end: string | null;
  price_id: string | null;
  price_type: string | null;
  status: string;
}

function getPriceId(type: string) {
  switch (type) {
    case "pro-month":
      return process.env.STRIPE_PRO_MONTH_PRICE_ID ?? "";
    case "pro-year":
      return process.env.STRIPE_PRO_YEAR_PRICE_ID ?? "";
    default:
      throw new Error("Invalid subscription type");
  }
}

function getPriceType(priceId: string) {
  switch (priceId) {
    case process.env.STRIPE_PRO_MONTH_PRICE_ID ?? "":
      return "pro-month";
    case process.env.STRIPE_PRO_YEAR_PRICE_ID ?? "":
      return "pro-year";
    default:
      throw new Error("Invalid subscription price ID");
  }
}

function getPriceName(type: string) {
  switch (type) {
    case "pro-month":
      return "$5 per month";
    case "pro-year":
      return "$48 per year";
    default:
      throw new Error("Invalid subscription type");
  }
}

interface GetSubscriptionDateProps {
  supabaseAdmin: SupabaseClient;
  user: User;
}

async function getSubscription({
  supabaseAdmin,
  user,
}: GetSubscriptionDateProps): Promise<Subscription> {
  const { data: subscriptionData, error: subscriptionError } =
    await supabaseAdmin
      .from("subscriptions")
      .select("status, current_period_end, price_id")
      .eq("user_id", user.id)
      .single();

  if (subscriptionError) {
    // throw new Error("Failed to get subscription status");
    return {
      current_period_end: null,
      price_id: null,
      price_type: null,
      status: "none",
    };
  }

  // No subscription found
  if (!subscriptionData.status) {
    return {
      current_period_end: null,
      price_id: null,
      price_type: null,
      status: "none",
    };
  }

  const subscription = {
    ...subscriptionData,
    price_type: getPriceType(subscriptionData.price_id),
  } as Subscription;

  // Subscription expired
  if (
    subscription.status === "active" &&
    subscription.current_period_end &&
    new Date(subscription.current_period_end) < new Date()
  ) {
    subscription.status = "expired";
  }

  return subscription;
}

interface HasActiveSubscriptionProps {
  supabaseAdmin: SupabaseClient;
  user: User;
}

async function hasActiveSubscription({
  supabaseAdmin,
  user,
}: HasActiveSubscriptionProps): Promise<boolean> {
  const subscription = await getSubscription({ supabaseAdmin, user });

  return subscription.status === "active";
}

async function gateHasActiveSubscription({
  supabaseAdmin,
  user,
}: HasActiveSubscriptionProps): Promise<void> {
  const hasActive = await hasActiveSubscription({ supabaseAdmin, user });

  if (!hasActive) {
    throw new Error("User does not have an active subscription");
  }
}

export {
  gateHasActiveSubscription,
  getPriceId,
  getPriceName,
  getPriceType,
  getSubscription,
  hasActiveSubscription,
  type Subscription,
};
