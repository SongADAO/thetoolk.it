interface ServiceAccount {
  id: string;
  username: string;
}

interface PostProps {
  title: string;
  text: string;
  userId: string;
  username: string;
  video: File | null;
  videoUrl: string;
  videoHSLUrl: string;
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
