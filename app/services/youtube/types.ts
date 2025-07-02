interface YoutubeAuthorization {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

interface YoutubeCredentials {
  clientId: string;
  clientSecret: string;
}

const defaultAuthorization: YoutubeAuthorization = {
  accessToken: "",
  accessTokenExpiresAt: "",
  refreshToken: "",
  refreshTokenExpiresAt: "",
};

const defaultCredentials: YoutubeCredentials = {
  clientId: "",
  clientSecret: "",
};

export {
  defaultAuthorization,
  defaultCredentials,
  type YoutubeAuthorization,
  type YoutubeCredentials,
};
