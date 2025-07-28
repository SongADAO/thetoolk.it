"use client";

import { use } from "react";

import { AuthContext } from "@/contexts/AuthContext";

export default function UserProfile(): JSX.Element {
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
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
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
      <button
        className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        onClick={handleSignOut}
      >
        Sign Out
      </button>
    </div>
  );
}
