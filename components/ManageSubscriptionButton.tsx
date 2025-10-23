"use client";

export function ManageSubscriptionButton() {
  async function handleManageSubscription() {
    try {
      const res = await fetch("/api/subscriptions/create-portal-session", {
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Error creating portal session:", error);

        if (error.error) {
          throw new Error(error.error);
        } else {
          throw new Error("Failed to create portal session");
        }
      }

      const { url } = await res.json();

      if (!url) {
        throw new Error("No management URL returned from server");
      }

      window.location.href = url;
    } catch (error: unknown) {
      console.error("Error:", error);
      // eslint-disable-next-line no-alert
      alert(
        error instanceof Error
          ? error.message
          : "Failed to open subscription management",
      );
    }
  }

  return (
    <button
      className="cursor-pointer rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
      onClick={handleManageSubscription}
      type="button"
    >
      Manage Subscription
    </button>
  );
}
