import Link from "next/link";

function AppFooter() {
  return (
    <div className="flex items-center justify-center gap-2 border-t border-gray-400 bg-gray-300">
      <div className="flex flex-col items-center justify-center gap-4 p-2 text-center">
        <div className="flex items-center gap-8 text-sm">
          <Link
            className="text-black underline hover:text-blue-800"
            href="/terms-of-service"
          >
            Terms of Service
          </Link>
          <Link
            className="text-black underline hover:text-blue-800"
            href="/privacy-policy"
          >
            Privacy Policy
          </Link>
        </div>
        <div className="flex flex-col gap-1 text-xs text-gray-600 md:flex-row md:gap-2 lg:gap-8">
          <div>TheToolk.it &copy;2025</div>

          <div className="flex items-center justify-center gap-2">
            <div>
              License:{" "}
              <a
                className="text-black underline hover:text-blue-800"
                href="https://www.gnu.org/licenses/gpl-3.0.en.html#license-text"
                target="_blank"
              >
                GPLv3
              </a>
            </div>

            <div>
              Source:{" "}
              <a
                className="text-black underline hover:text-blue-800"
                href="https://github.com/SongADAO/thetoolk.it"
                target="_blank"
              >
                GitHub
              </a>
            </div>
          </div>

          <div>
            Created by{" "}
            <a
              className="text-black underline hover:text-blue-800"
              href="https://x.com/Alan_Purring"
              rel="noopener noreferrer"
              target="_blank"
            >
              @Alan_Purring
            </a>{" "}
            &{" "}
            <a
              className="text-black underline hover:text-blue-800"
              href="https://x.com/songadaymann"
              rel="noopener noreferrer"
              target="_blank"
            >
              @songadaymann
            </a>
          </div>

          <div>
            Executive produced by{" "}
            <a
              className="text-black underline hover:text-blue-800"
              href="https://x.com/cxy"
              rel="noopener noreferrer"
              target="_blank"
            >
              @cxy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export { AppFooter };
