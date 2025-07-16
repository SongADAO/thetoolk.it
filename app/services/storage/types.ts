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

interface PinataCredentials {
  apiKey: string;
  apiSecret: string;
  jwt: string;
  gateway: string;
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

const defaultPinataCredentials: PinataCredentials = {
  apiKey: "",
  apiSecret: "",
  jwt: "",
  gateway: "",
};

export {
  type AmazonS3Credentials,
  defaultAmazonS3Credentials,
  defaultOauthAuthorization,
  defaultPinataCredentials,
  type OauthAuthorization,
  type PinataCredentials,
  type ServiceAccount,
};
