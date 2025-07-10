interface ServiceAccount {
  accessToken: string;
  id: string;
  username: string;
}

interface PostProps {
  text: string;
  userId: string;
  videoUrl: string;
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
