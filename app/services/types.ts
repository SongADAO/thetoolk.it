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

interface ServiceAccount {
  accessToken: string;
  id: string;
  username: string;
}

export {
  defaultOauthAuthorization,
  defaultOauthCredentials,
  type OauthAuthorization,
  type OauthCredentials,
  type ServiceAccount,
};
