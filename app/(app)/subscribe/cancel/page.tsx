import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  alternates: {
    canonical: "/subscribe/cancel",
  },
  description:
    "You cancelled your subscription checkout before completing it. You have not been charged. Click the button below to return to TheToolk.it.",
  robots: {
    follow: false,
    index: false,
  },
  title: "Subscribe Cancelled - TheToolk.it",
};

export default function SubscribeCancelPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 md:pt-20">
      <p>
        You cancelled your subscription checkout before completing it. You have
        not been charged.
      </p>

      <Link
        className="cursor-pointer rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        href="/pro"
      >
        Return to TheToolk.it
      </Link>
    </div>
  );
}
