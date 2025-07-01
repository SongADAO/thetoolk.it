import { S3Provider } from "@/app/services/s3/S3Provider";
import { YoutubeProvider } from "@/app/services/youtube/YoutubeProvider";
import { YoutubeSwitch } from "@/app/services/youtube/YoutubeSwitch";

export default function Share() {
  return (
    <div className="bg-gray-100 p-8">
      <S3Provider>
        <YoutubeProvider>
          <YoutubeSwitch />
        </YoutubeProvider>
      </S3Provider>
    </div>
  );
}
