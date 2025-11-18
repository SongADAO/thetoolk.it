import Link from "next/link";

function AppFooter() {
  return (
    <div className="flex items-center justify-center gap-2 bg-gray-200">
      <div className="flex flex-col items-center justify-center gap-1 p-2 text-center">
        <div className="flex items-center gap-4">
          <span>TheToolk.it</span>{" "}
          <span>
            License:{" "}
            <a
              className="text-blue-600 underline hover:text-blue-800"
              href="https://www.gnu.org/licenses/gpl-3.0.en.html#license-text"
              target="_blank"
            >
              GPLv3
            </a>
          </span>
          <span>
            Source:{" "}
            <a
              className="text-blue-600 underline hover:text-blue-800"
              href="https://github.com/SongADAO/thetoolk.it"
              target="_blank"
            >
              GitHub
            </a>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            className="text-blue-600 underline hover:text-blue-800"
            href="/terms-of-service"
          >
            Terms of Service
          </Link>
          <Link
            className="text-blue-600 underline hover:text-blue-800"
            href="/privacy-policy"
          >
            Privacy Policy
          </Link>
        </div>
        <div className="text-xs text-gray-600">
          Created by{" "}
          <a
            className="text-blue-600 underline hover:text-blue-800"
            href="https://x.com/Alan_Purring"
            rel="noopener noreferrer"
            target="_blank"
          >
            @Alan_Purring
          </a>{" "}
          &{" "}
          <a
            className="text-blue-600 underline hover:text-blue-800"
            href="https://x.com/songadaymann"
            rel="noopener noreferrer"
            target="_blank"
          >
            @songadaymann
          </a>{" "}
          | Executive produced by{" "}
          <a
            className="text-blue-600 underline hover:text-blue-800"
            href="https://x.com/cxy"
            rel="noopener noreferrer"
            target="_blank"
          >
            @cxy
          </a>
        </div>
      </div>
    </div>
  );
}

export { AppFooter };
