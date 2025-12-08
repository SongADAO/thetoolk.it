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
              alt="A screenshot of TheToolk.it Pro"
              className="h-auto w-full rounded-xs border border-gray-400 border-r-black border-b-black shadow-lg contain-paint"
              height="1470"
              src="/thetoolkit-preview.webp"
              width="2688"
            />
          </Link>
        </div>
        <section>
          <h1 className="mb-4 text-4xl font-bold">TheToolk.it</h1>
          <p className="mb-4">
            TheToolk.it is your one place to post videos to all your favorite
            social media networks at once.
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
                <li>
                  TikTok <em className="font-semibold">(pro only)</em>
                </li>
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

          <div className="mt-10 max-w-160 bg-yellow-100 p-4">
            <p className="mb-4 text-left font-semibold">
              TheToolk.it Free Edition
            </p>
            <p className="mb-4 text-left">
              TheToolk.it Pro requires zero API setup for all posting services
              offered. All API setup and any file storage costs are part of your
              plan.
            </p>
            <p className="mb-4 text-left">
              For the more technically inclined we also offer{" "}
              <strong>TheToolk.it Free Edition</strong>. The free edition runs
              in your browser and requires you to provide your own API keys for
              posting and storage services.
            </p>
            <p className="text-left">
              <LinkButton href="https://free.thetoolk.it" target="_blank">
                Try TheToolk.it Free Edition
              </LinkButton>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
