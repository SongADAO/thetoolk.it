import { createContext } from "react";

import type { PostServiceContextType } from "@/services/post/PostServiceContext";

interface PostVideo {
  video: File | null;
  videoUrl: string | null;
  videoHSLUrl: string | null;
}

interface CreatePostProps {
  facebookPrivacy: string;
  text: string;
  tiktokComment: boolean;
  tiktokDisclose: boolean;
  tiktokDiscloseBrandOther: boolean;
  tiktokDiscloseBrandSelf: boolean;
  tiktokDuet: boolean;
  tiktokPrivacy: string;
  tiktokStitch: boolean;
  title: string;
  videos: Record<string, PostVideo>;
  youtubePrivacy: string;
}

interface CreatePlatformPostProps extends CreatePostProps {
  platform: PostServiceContextType;
}

interface CreatePostContextType {
  unauthorizedPostServices: PostServiceContextType[];
  hasUnauthorizedPostServices: boolean;
  unauthorizedStorageServices: PostServiceContextType[];
  hasUnauthorizeStorageServices: boolean;
  createPost: (params: CreatePostProps) => Promise<void>;
  getVideoInfo: (video: File | null) => void;
  hlsConversionError: string | null;
  hlsConversionProgress: number;
  hlsConversionStatus: string;
  isHLSConverting: boolean;
  isPosting: boolean;
  isStoring: boolean;
  isVideoConverting: boolean;
  isVideoTrimming: boolean;
  preparePostVideo: (selectedFile: File) => Promise<Record<string, PostVideo>>;
  resetPostState: () => void;
  resetStoreState: () => void;
  videoCodecInfo: string;
  videoConversionError: string | null;
  videoConversionProgress: number;
  videoConversionStatus: string;
  videoDuration: number;
  videoFileSize: number;
  videoPreviewUrl: string;
  videoTrimError: string;
  videoTrimProgress: number;
  videoTrimStatus: string;
}

const CreatePostContext = createContext<CreatePostContextType>({
  canPostToAllServices: false,
  canStoreToAllServices: false,
  createPost: async () => {},
  getVideoInfo: () => {},
  hlsConversionError: null,
  hlsConversionProgress: 0,
  hlsConversionStatus: "",
  isHLSConverting: false,
  isPosting: false,
  isStoring: false,
  isVideoConverting: false,
  isVideoTrimming: false,
  preparePostVideo: async () =>
    await Promise.resolve({
      full: {
        video: null,
        videoHSLUrl: "",
        videoUrl: "",
      },
    }),
  resetPostState: () => {},
  resetStoreState: () => {},
  videoCodecInfo: "",
  videoConversionError: null,
  videoConversionProgress: 0,
  videoConversionStatus: "",
  videoDuration: 0,
  videoFileSize: 0,
  videoPreviewUrl: "",
  videoTrimError: "",
  videoTrimProgress: 0,
  videoTrimStatus: "",
});

export {
  type CreatePlatformPostProps,
  CreatePostContext,
  type CreatePostProps,
  type PostVideo,
};
