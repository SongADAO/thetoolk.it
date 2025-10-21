"use client";

interface SubscribeButtonProps {
  type: string;
  label: string;
}

function SubscribeButton({ type, label }: Readonly<SubscribeButtonProps>) {
  async function handleCheckout() {
    const res = await fetch("/api/subscriptions/checkout", {
      body: JSON.stringify({ type }),
      method: "POST",
    });

    const { url } = await res.json();

    window.location.href = url;
  }

  return (
    <button onClick={handleCheckout} type="button">
      {label}
    </button>
  );
}

export { SubscribeButton };
