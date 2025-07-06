import { PostSettings } from "@/app/components/PostSettings";
import { FacebookProvider } from "@/app/services/facebook/Provider";
import { InstagramProvider } from "@/app/services/instagram/Provider";
import { S3Provider } from "@/app/services/s3/S3Provider";
import { YoutubeProvider } from "@/app/services/youtube/Provider";

export function Post() {
  return (
    <S3Provider>
      <YoutubeProvider>
        <InstagramProvider>
          <FacebookProvider>
            <PostSettings />
          </FacebookProvider>
        </InstagramProvider>
      </YoutubeProvider>
    </S3Provider>
  );
}
