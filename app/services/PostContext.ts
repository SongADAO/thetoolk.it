import { createContext } from "react";

interface PostVideo {
  video: File | null;
  videoUrl: string;
  videoHSLUrl: string;
}

interface CreatePostProps {
  text: string;
  title: string;
  videos: {
    base: PostVideo;
    bluesky?: PostVideo;
    facebook?: PostVideo;
    instagram?: PostVideo;
    neynar?: PostVideo;
    threads?: PostVideo;
    tiktok?: PostVideo;
    twitter?: PostVideo;
    youtube?: PostVideo;
  };
}

interface PostContextType {
  canPostToAllServices: boolean;
  canStoreToAllServices: boolean;
  createPost: (params: CreatePostProps) => Promise<void>;
  getVideoInfo: (video: File | null) => void;
  hlsConversionError: string | null;
  hlsConversionProgress: number;
  hlsConversionStatus: string;
  isHLSConverting: boolean;
  isVideoConverting: boolean;
  preparePostVideo: (selectedFile: File) => Promise<Record<string, PostVideo>>;
  videoCodecInfo: string;
  videoConversionError: string | null;
  videoConversionProgress: number;
  videoConversionStatus: string;
  videoDuration: number;
  videoFileSize: number;
  videoPreviewUrl: string;
}

const PostContext = createContext<PostContextType>({
  canPostToAllServices: false,
  canStoreToAllServices: false,
  createPost: async () => {},
  getVideoInfo: () => {},
  hlsConversionError: null,
  hlsConversionProgress: 0,
  hlsConversionStatus: "",
  isHLSConverting: false,
  isVideoConverting: false,
  preparePostVideo: async () =>
    await Promise.resolve({
      base: {
        video: null,
        videoHSLUrl: "",
        videoUrl: "",
      },
    }),
  videoCodecInfo: "",
  videoConversionError: null,
  videoConversionProgress: 0,
  videoConversionStatus: "",
  videoDuration: 0,
  videoFileSize: 0,
  videoPreviewUrl: "",
});

export { type CreatePostProps, PostContext, type PostVideo };
