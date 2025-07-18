interface ServiceAccount {
  accessToken: string;
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
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

interface OauthCredentials {
  clientId: string;
  clientSecret: string;
}

interface BlueskyCredentials {
  appPassword: string;
  serviceUrl: string;
  username: string;
}

const defaultOauthAuthorization: OauthAuthorization = {
  accessToken: "",
  accessTokenExpiresAt: "",
  refreshToken: "",
  refreshTokenExpiresAt: "",
};

const defaultOauthCredentials: OauthCredentials = {
  clientId: "",
  clientSecret: "",
};

const defaultBlueskyCredentials: BlueskyCredentials = {
  appPassword: "",
  serviceUrl: "",
  username: "",
};

export {
  type BlueskyCredentials,
  defaultBlueskyCredentials,
  defaultOauthAuthorization,
  defaultOauthCredentials,
  type OauthAuthorization,
  type OauthCredentials,
  type PostProps,
  type ServiceAccount,
};
