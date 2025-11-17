"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";

import { AuthContext } from "@/contexts/AuthContext";

function UserProfile() {
  const { user, signOut, loading, isAuthenticated } = use(AuthContext);

  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div>Not authenticated</div>;
  }

  async function handleSignOut(): Promise<void> {
    await signOut("local");
    router.push("/auth/signin");
  }

  return (
    <div className="mx-auto rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-bold">Profile</h1>
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
          href="/account/manage"
        >
          Manage Account
        </Link>
      </div>
    </div>
  );
}

export { UserProfile };
