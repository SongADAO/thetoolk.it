import { LinkButton } from "@/components/general/LinkButton";

function FreeBanner() {
  return (
    <div className="space-y-2 bg-yellow-100 p-4 text-center">
      <p>
        You&apos;re using{" "}
        <strong className="font-semibold">TheToolk.it Free Edition</strong>.
      </p>
      <p>
        <LinkButton href="/pro">Switch to TheToolk.it Pro</LinkButton>
      </p>
    </div>
  );
}

export { FreeBanner };
