"use client";

import Link from "next/link";
import { use } from "react";

import { AuthContext } from "@/contexts/AuthContext";

function UserProfile() {
  const { user, loading, isAuthenticated } = use(AuthContext);

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div className="p-4 text-center">Not authenticated</div>;
  }

  return (
    <section className="mx-auto w-full space-y-4 rounded bg-gray-100 pb-4 contain-paint">
      <header className="bg-gray-300 px-4 py-2">
        <h1 className="font-bold">Profile</h1>
      </header>
      <div className="space-y-2 px-4">
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>User ID:</strong> {user.id}
        </p>
        <p>
          <strong>Created:</strong>{" "}
          {new Date(user.created_at).toLocaleDateString()}
        </p>
        <p>
          <strong>Email Verified:</strong>{" "}
          {user.email_confirmed_at ? "Yes" : "No"}
        </p>
      </div>
      <div className="flex items-center gap-4 px-4">
        <Link
          className="cursor-pointer rounded bg-black px-4 py-2 text-white hover:bg-blue-800"
          href="/account/manage"
        >
          Manage Account
        </Link>
      </div>
    </section>
  );
}

export { UserProfile };
