import { createContext, ReactNode } from "react";

interface PostVideo {
  video: File | null;
  videoUrl: string;
  videoHSLUrl: string;
}

interface PostContextType {
  createPost: (
    text: string,
    title: string,
    video: File | null,
    videoUrl: string,
    videoHSLUrl: string,
  ) => Promise<void>;
  getVideoInfo: (video: File | null) => Promise<void>;
  hlsConversionError: string | null;
  hlsConversionProgress: number;
  isHLSConverting: boolean;
  isVideoConverting: boolean;
  preparePostVideo: (video: File | null) => Promise<PostVideo>;
  videoCodecInfo: string;
  videoConversionError: string | null;
  videoConversionProgress: number;
  videoDuration: number;
  videoFileSize: number;
  videoPreviewUrl: string;
}

const PostContext = createContext<PostContextType>({
  createPost: async () => {},
  getVideoInfo: async () => {},
  hlsConversionError: null,
  hlsConversionProgress: 0,
  isHLSConverting: false,
  isVideoConverting: false,
  preparePostVideo: async () => ({
    video: null,
    videoUrl: "",
    videoHSLUrl: "",
  }),
  videoCodecInfo: "",
  videoConversionError: null,
  videoConversionProgress: 0,
  videoDuration: 0,
  videoFileSize: 0,
  videoPreviewUrl: "",
});

export { PostContext, type PostVideo };
