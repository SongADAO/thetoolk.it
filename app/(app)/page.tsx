"use client";

import Link from "next/link";
import { use } from "react";

import { Poster } from "@/components/Poster";
import { AuthContext } from "@/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated } = use(AuthContext);

  return (
    <div>
      {isAuthenticated ? (
        <Poster />
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
