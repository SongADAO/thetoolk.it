import { AmazonS3Context } from "@/app/services/storage/amazons3/Context";
import { PinataContext } from "@/app/services/storage/pinata/Context";

const STORAGE_CONTEXTS = [
  { context: AmazonS3Context, id: "AmazonS3Context" },
  { context: PinataContext, id: "PinataContext" },
];

export { STORAGE_CONTEXTS };
