interface ServiceAccount {
  accessToken: string;
  id: string;
  username: string;
}

interface OauthAuthorization {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

interface AmazonS3Credentials {
  accessKeyId: string;
  bucket: string;
  region: string;
  secretAccessKey: string;
}

const defaultOauthAuthorization: OauthAuthorization = {
  accessToken: "",
  accessTokenExpiresAt: "",
  refreshToken: "",
  refreshTokenExpiresAt: "",
};

const defaultAmazonS3Credentials: AmazonS3Credentials = {
  accessKeyId: "",
  bucket: "",
  region: "",
  secretAccessKey: "",
};

export {
  type AmazonS3Credentials,
  defaultAmazonS3Credentials,
  defaultOauthAuthorization,
  type OauthAuthorization,
  type ServiceAccount,
};
