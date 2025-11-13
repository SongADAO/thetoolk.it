"use client";

import Link from "next/link";
import { use } from "react";

import { Poster } from "@/components/Poster";
import { PostProviders } from "@/components/service/post/PostProviders";
import { StorageProviders } from "@/components/service/storage/StorageProviders";
import { AuthContext } from "@/contexts/AuthContext";
import { UserStorageProvider } from "@/contexts/UserStorageProvider";

export default function FreePage() {
  const { isAuthenticated } = use(AuthContext);

  return (
    <div>
      <div className="bg-yellow-100 p-4 text-center">
        {isAuthenticated ? (
          <p>
            You&apos;re using TheToolk.it{" "}
            <strong className="font-semibold">Free Edition</strong>.{" "}
            <Link className="underline" href="/subscribe">
              Subscribe
            </Link>{" "}
            to unlock Pro features.{" "}
          </p>
        ) : (
          <p>
            You&apos;re using TheToolk.it{" "}
            <strong className="font-semibold">Free Edition</strong>.{" "}
            <Link className="underline" href="/auth/signup">
              Create an Account and Subscribe
            </Link>{" "}
            to unlock Pro features.{" "}
          </p>
        )}
      </div>
      <UserStorageProvider mode="self">
        <StorageProviders mode="self">
          <PostProviders mode="self">
            <Poster mode="self" />
          </PostProviders>
        </StorageProviders>
      </UserStorageProvider>
    </div>
  );
}
