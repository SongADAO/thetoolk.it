import Link from "next/link";

export default function SubscribeCancelPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 md:pt-20">
      <p>
        You cancelled your subscription checkout before completing it. You have
        not been charged.
      </p>

      <Link
        className="cursor-pointer rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        href="/"
      >
        Return to TheToolk.it
      </Link>
    </div>
  );
}
