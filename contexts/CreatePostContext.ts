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
  createPost: (params: CreatePostProps) => Promise<void>;
  getVideoInfo: (video: File | null) => void;
  hasPostPlatform: boolean;
  hasStoragePlatform: boolean;
  hasUnauthorizedPostServices: boolean;
  hasUnauthorizedStorageServices: boolean;
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
  unauthorizedPostServices: PostServiceContextType[];
  unauthorizedStorageServices: PostServiceContextType[];
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
  createPost: async () => {},
  getVideoInfo: () => {},
  hasPostPlatform: false,
  hasStoragePlatform: false,
  hasUnauthorizedPostServices: false,
  hasUnauthorizedStorageServices: false,
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
  unauthorizedPostServices: [],
  unauthorizedStorageServices: [],
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
