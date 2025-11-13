export default function Home() {
  return (
    <div>
      <div className="mb-10 grid grid-cols-1 items-center justify-center gap-4 p-4 md:grid-cols-2 md:gap-8 md:p-4">
        <div className="flex max-w-130 items-center justify-center md:m-auto lg:max-w-160">
          <img
            alt="TheToolk.it Pro Screenshot"
            className="h-auto w-full rounded-lg border-8 border-gray-500 contain-paint"
            src="/home-screenshot.webp"
          />
        </div>
        <div>
          <h1 className="mb-4 text-4xl font-bold">TheToolk.it</h1>
          <p className="mb-4">
            TheToolk.it Pro is your one place to post videos to all your
            favorite social media networks at once.
          </p>
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
        </div>
      </div>
    </div>
  );
}
