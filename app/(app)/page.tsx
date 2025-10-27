"use client";

import Link from "next/link";
import { use } from "react";

import { Poster } from "@/components/Poster";
import { PostProviders } from "@/components/service/post/PostProviders";
import { StorageProviders } from "@/components/service/storage/StorageProviders";
import { AuthContext } from "@/contexts/AuthContext";
import { UserStorageProvider } from "@/contexts/UserStorageProvider";

export default function Home() {
  const { isAuthenticated } = use(AuthContext);

  return (
    <div>
      {isAuthenticated ? (
        <UserStorageProvider mode="hosted">
          <StorageProviders mode="hosted">
            <PostProviders mode="hosted">
              <Poster mode="hosted" />
            </PostProviders>
          </StorageProviders>
        </UserStorageProvider>
      ) : (
        <div>
          <p className="mt-10 text-center">
            <Link className="underline" href="/auth/signup">
              Create an Account
            </Link>{" "}
            to use TheToolk.it
          </p>

          <p className="mt-10 text-center">
            <Link className="underline" href="/free">
              Try our Free version
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
