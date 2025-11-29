import { LinkButton } from "@/components/general/LinkButton";

function FreeBanner() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 border-b border-gray-400 bg-yellow-100 p-2 text-center md:flex-row md:gap-8">
      <p>
        You&apos;re using{" "}
        <strong className="font-semibold">TheToolk.it Free Edition</strong>.
      </p>
      <p>
        <LinkButton href="https://dev.thetoolk.it/pro">
          Switch to TheToolk.it Pro
        </LinkButton>
      </p>
    </div>
  );
}

export { FreeBanner };
