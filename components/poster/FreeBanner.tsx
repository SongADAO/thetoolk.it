import Link from "next/link";

function FreeBanner() {
  return (
    <div className="bg-yellow-100 p-4 text-center">
      <p>
        You&apos;re using{" "}
        <strong className="font-semibold">TheToolk.it Free Edition</strong>.{" "}
        <Link className="underline" href="/pro">
          Switch to TheToolk.it Pro
        </Link>{" "}
        to unlock Pro features.
      </p>
    </div>
  );
}

export { FreeBanner };
