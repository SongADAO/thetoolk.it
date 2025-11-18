"use client";

import { AmazonS3Context } from "@/services/storage/amazons3/Context";
import { PinataContext } from "@/services/storage/pinata/Context";

const STORAGE_CONTEXTS = [
  {
    context: AmazonS3Context,
    id: "AmazonS3Context",
    modes: ["hosted", "self"],
  },
  { context: PinataContext, id: "PinataContext", modes: ["hosted", "self"] },
];

export { STORAGE_CONTEXTS };
