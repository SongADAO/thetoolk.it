import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  alternates: {
    canonical: "/subscribe/success",
  },
  description:
    "Thank you for subscribing to TheToolk.it Pro! Your payment was successful, and you can now start using all the features of TheToolk.it Pro. Click the button below to get started.",
  robots: {
    follow: false,
    index: false,
  },
  title: "Subscribe Success - TheToolk.it",
};

export default function SubscribeSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 md:pt-20">
      <p>Thanks for subscribing! Your payment was successful.</p>
      <Link
        className="cursor-pointer rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        href="/pro"
      >
        Start Using TheToolk.it Pro
      </Link>
    </div>
  );
}
