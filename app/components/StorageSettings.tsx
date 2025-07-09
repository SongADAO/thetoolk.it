"use client";

import { PostServiceSettings } from "@/app/components/PostServiceSettings";
import { AmazonS3Context } from "@/app/services/storage/amazons3/Context";

export function StorageSettings() {
  const contexts = [{ context: AmazonS3Context, id: "AmazonS3Context" }];

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
