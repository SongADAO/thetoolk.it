import Link from "next/link";

import { LinkButton } from "@/components/general/LinkButton";
import { PosterBrowserMode } from "@/components/poster/PosterBrowserMode";
import { MODE } from "@/config/constants";

export default function Home() {
  if (MODE === "browser") {
    return <PosterBrowserMode />;
  }

  return (
    <div>
      <div className="mt-2 mb-10 grid grid-cols-1 items-center justify-center gap-10 p-4 md:mt-20 md:grid-cols-2 md:gap-8 md:p-4">
        <div className="flex max-w-130 items-center justify-center md:m-auto lg:max-w-160">
          <Link href="/pro">
            <img
              alt="TheToolk.it Pro Screenshot"
              className="h-auto w-full rounded-xs border border-gray-400 border-r-black border-b-black shadow-lg contain-paint"
              src="/home-screenshot.webp"
            />
          </Link>
        </div>
        <section>
          <h1 className="mb-4 text-4xl font-bold">TheToolk.it</h1>
          <p className="mb-4">
            TheToolk.it Pro is your one place to post videos to all your
            favorite social media networks at once.
          </p>
          <section className="mb-4">
            <h2 className="mb-2 font-semibold">Supported Networks</h2>
            <div className="grid max-w-100 grid-cols-2 items-start justify-start gap-4 md:flex-row">
              <ul className="list-disc pl-5">
                <li>Bluesky</li>
                <li>Facebook</li>
                <li>Farcaster</li>
                <li>Instagram</li>
              </ul>
              <ul className="list-disc pl-5">
                <li>TikTok</li>
                <li>Threads</li>
                <li>X (Twitter)</li>
                <li>YouTube</li>
              </ul>
            </div>
          </section>
          <section>
            <h2 className="mb-2 font-semibold">Get Started Now</h2>
            <div className="grid max-w-100 items-start justify-start gap-4 md:flex-row">
              <LinkButton href="/pro">Access TheToolk.it Pro</LinkButton>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
