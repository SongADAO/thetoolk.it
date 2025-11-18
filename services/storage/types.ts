interface StorageServiceAccount {
  id: string;
  username: string;
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

const defaultAmazonS3Credentials: AmazonS3Credentials = {
  accessKeyId: "",
  bucket: "",
  region: "",
  secretAccessKey: "",
};

const defaultPinataCredentials: PinataCredentials = {
  apiKey: "",
  apiSecret: "",
  gateway: "",
  jwt: "",
};

export {
  type AmazonS3Credentials,
  defaultAmazonS3Credentials,
  defaultPinataCredentials,
  type PinataCredentials,
  type StorageServiceAccount,
};
