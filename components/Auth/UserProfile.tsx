"use client";
import Link from "next/link";
import { use } from "react";

import { AuthContext } from "@/contexts/AuthContext";

function UserProfile() {
  const { user, signOut, loading, isAuthenticated } = use(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div>Not authenticated</div>;
  }

  const handleSignOut = async (): Promise<void> => {
    await signOut();
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-gray-50 p-6 shadow-md">
      <h2 className="mb-4 text-2xl font-bold">Profile</h2>
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
      <div className="flex gap-4">
        <button
          className="mt-4 cursor-pointer rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          onClick={handleSignOut}
          type="button"
        >
          Sign Out
        </button>
        <Link
          className="mt-4 cursor-pointer rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-800"
          href="/account-settings"
        >
          Manage Account Details
        </Link>
      </div>
    </div>
  );
}

export { UserProfile };
