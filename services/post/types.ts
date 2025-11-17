interface ServiceAccount {
  id: string;
  username: string;
  permissions?: {
    comment_disabled: boolean;
    duet_disabled: boolean;
    max_video_post_duration_sec: number;
    privacy_level_options: string[];
    stitch_disabled: boolean;
  };
}

interface PostProps {
  options: {
    disclose?: boolean;
    discloseBrandOther?: boolean;
    discloseBrandSelf?: boolean;
    permissionComment?: boolean;
    permissionDuet?: boolean;
    permissionStitch?: boolean;
  };
  privacy: string;
  text: string;
  title: string;
  userId: string;
  username: string;
  video: File | null;
  videoHSLUrl: string;
  videoUrl: string;
}

interface OauthAuthorization {
  accessToken: string;
  refreshToken: string;
}

interface OauthExpiration {
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

interface OauthCredentials {
  clientId: string;
  clientSecret: string;
  serviceUrl: string;
  username: string;
}

interface OauthAuthorizationAndExpiration {
  authorization: OauthAuthorization;
  expiration: OauthExpiration;
}

const defaultOauthAuthorization: OauthAuthorization = {
  accessToken: "",
  refreshToken: "",
};

const defaultOauthExpiration: OauthExpiration = {
  accessTokenExpiresAt: "",
  refreshTokenExpiresAt: "",
};

const defaultOauthCredentials: OauthCredentials = {
  clientId: "",
  clientSecret: "",
  serviceUrl: "",
  username: "",
};

interface CreatePostProps {
  accessToken: string;
  credentials: OauthCredentials;
  options: {
    disclose?: boolean;
    discloseBrandOther?: boolean;
    discloseBrandSelf?: boolean;
    permissionComment?: boolean;
    permissionDuet?: boolean;
    permissionStitch?: boolean;
  };
  privacy: string;
  requestUrl: string;
  setIsPosting: (isPosting: boolean) => void;
  setPostError: (error: string) => void;
  setPostProgress: (progress: number) => void;
  setPostStatus: (status: string) => void;
  text: string;
  title: string;
  userId: string;
  video: File | null;
  videoHSLUrl: string;
  videoUrl: string;
}

export {
  type CreatePostProps,
  defaultOauthAuthorization,
  defaultOauthCredentials,
  defaultOauthExpiration,
  type OauthAuthorization,
  type OauthAuthorizationAndExpiration,
  type OauthCredentials,
  type OauthExpiration,
  type PostProps,
  type ServiceAccount,
};
