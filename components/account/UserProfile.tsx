"use client";

import Link from "next/link";
import { use } from "react";

import { AuthContext } from "@/contexts/AuthContext";

function UserProfile() {
  const { user, loading, isAuthenticated } = use(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div>Not authenticated</div>;
  }

  return (
    <section className="mx-auto space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="space-y-2">
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
      <div className="flex items-center justify-start gap-4">
        <Link
          className="cursor-pointer rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-800"
          href="/account/manage"
        >
          Manage Account
        </Link>
      </div>
    </section>
  );
}

export { UserProfile };
