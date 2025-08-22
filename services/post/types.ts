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
}

interface OauthAuthorizationAndExpiration {
  authorization: OauthAuthorization;
  expiration: OauthExpiration;
}

interface BlueskyCredentials {
  serviceUrl: string;
  username: string;
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
};

const defaultBlueskyCredentials: BlueskyCredentials = {
  serviceUrl: "",
  username: "",
};

export {
  type BlueskyCredentials,
  defaultBlueskyCredentials,
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
