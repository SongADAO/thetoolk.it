import { PinataSDK } from "pinata";

import type { PinataCredentials } from "@/app/services/storage/types";

async function uploadFile(credentials: PinataCredentials, video: File) {
  const pinata = new PinataSDK({
    pinataJwt: credentials.jwt,
  });

  const upload = await pinata.upload.public.file(video);

  const contentUri = `ipfs://${upload.cid}`;

  return contentUri;
}

async function uploadVideo(credentials: PinataCredentials, video: File) {
  const pinata = new PinataSDK({
    pinataJwt: credentials.jwt,
  });

  const upload = await pinata.upload.public.file(video);

  const contentUri = `ipfs://${upload.cid}`;

  return contentUri;
}

async function uploadJson(credentials: PinataCredentials, data: object) {
  const pinata = new PinataSDK({
    pinataJwt: credentials.jwt,
  });

  // Pin metadata JSON to Pinata
  const upload = await pinata.upload.public.json(data);

  const contentUri = `ipfs://${upload.cid}`;

  return contentUri;
}

export { uploadFile, uploadJson, uploadVideo };
