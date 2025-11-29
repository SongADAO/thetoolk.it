import { FreeBanner } from "@/components/poster/FreeBanner";
import { Poster } from "@/components/poster/Poster";
import { PosterProviders } from "@/components/poster/PosterProviders";

function PosterBrowserMode() {
  return (
    <div>
      <FreeBanner />
      <PosterProviders mode="browser">
        <Poster mode="browser" />
      </PosterProviders>
    </div>
  );
}

export { PosterBrowserMode };
