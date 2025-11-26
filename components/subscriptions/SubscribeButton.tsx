interface SubscribeButtonProps {
  type: string;
  label: string;
}

function SubscribeButton({ type, label }: Readonly<SubscribeButtonProps>) {
  async function handleCheckout() {
    try {
      const res = await fetch("/api/subscriptions/checkout", {
        body: JSON.stringify({ type }),
        method: "POST",
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Error starting checkout:", error);

        if (error.error) {
          throw new Error(error.error);
        } else {
          throw new Error("Failed to create checkout page");
        }
      }

      const { url } = await res.json();

      if (!url) {
        throw new Error("No checkout URL returned from server");
      }

      window.location.href = url;
    } catch (error: unknown) {
      console.error("Error:", error);
      // eslint-disable-next-line no-alert
      alert(
        error instanceof Error
          ? error.message
          : "Failed to open subscription checkout",
      );
    }
  }

  return (
    <button
      className="cursor-pointer rounded-xs bg-black px-4 py-2 text-white hover:bg-blue-800 disabled:opacity-50"
      onClick={handleCheckout}
      type="button"
    >
      {label}
    </button>
  );
}

export { SubscribeButton };
