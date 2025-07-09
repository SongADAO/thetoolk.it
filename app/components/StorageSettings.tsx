"use client";

import { PostServiceSettings } from "@/app/components/PostServiceSettings";
import { AmazonS3Context } from "@/app/services/storage/amazons3/Context";
import { PinataContext } from "@/app/services/storage/pinata/Context";

export function StorageSettings() {
  const contexts = [
    { context: AmazonS3Context, id: "AmazonS3Context" },
    { context: PinataContext, id: "PinataContext" },
  ];

  return (
    <div className="bg-gray-100 p-8">
      <div className="flex flex-col gap-8">
        {contexts.map((context) => (
          <div className="flex flex-col gap-1" key={context.id}>
            <PostServiceSettings context={context.context} />
          </div>
        ))}
      </div>
    </div>
  );
}
