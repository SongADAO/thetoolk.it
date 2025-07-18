import { createContext, ReactNode } from "react";

interface PostVideo {
  video: File | null;
  videoUrl: string;
  videoHSLUrl: string;
}

interface CreatePostProps {
  text: string;
  title: string;
  video: File | null;
  videoHSLUrl: string;
  videoUrl: string;
}

interface PostContextType {
  createPost: (params: CreatePostProps) => Promise<void>;
  getVideoInfo: (video: File | null) => void;
  hlsConversionError: string | null;
  hlsConversionProgress: number;
  isHLSConverting: boolean;
  isVideoConverting: boolean;
  preparePostVideo: (selectedFile: File) => Promise<PostVideo>;
  videoCodecInfo: string;
  videoConversionError: string | null;
  videoConversionProgress: number;
  videoDuration: number;
  videoFileSize: number;
  videoPreviewUrl: string;
}

const PostContext = createContext<PostContextType>({
  createPost: async () => {},
  getVideoInfo: () => {},
  hlsConversionError: null,
  hlsConversionProgress: 0,
  isHLSConverting: false,
  isVideoConverting: false,
  preparePostVideo: async () =>
    await Promise.resolve({
      video: null,
      videoHSLUrl: "",
      videoUrl: "",
    }),
  videoCodecInfo: "",
  videoConversionError: null,
  videoConversionProgress: 0,
  videoDuration: 0,
  videoFileSize: 0,
  videoPreviewUrl: "",
});

export { type CreatePostProps, PostContext, type PostVideo };
