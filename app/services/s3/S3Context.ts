import { createContext } from "react";

interface S3ContextType {
  s3AccessKeyId: string;
  s3Bucket: string;
  s3Region: string;
  s3SecretAccessKey: string;
  setS3AccessKeyId: (s3AccessKeyId: string) => void;
  setS3Bucket: (s3Bucket: string) => void;
  setS3Region: (s3Region: string) => void;
  setS3SecretAccessKey: (s3SecretAccessKey: string) => void;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
const S3Context = createContext<S3ContextType>({
  s3AccessKeyId: "",
  s3Bucket: "",
  s3Region: "",
  s3SecretAccessKey: "",
  setS3AccessKeyId: (s3AccessKeyId: string) => {},
  setS3Bucket: (s3Bucket: string) => {},
  setS3Region: (s3Region: string) => {},
  setS3SecretAccessKey: (s3SecretAccessKey: string) => {},
});
/* eslint-enable @typescript-eslint/no-unused-vars */

export { S3Context };
