"use client";

import Link from "next/link";
import { use } from "react";

import { AuthContext } from "@/contexts/AuthContext";

function AppHeaderUser() {
  const { user, signOut } = use(AuthContext);

  if (!user) {
    return (
      <div className="flex flex-row items-end gap-2">
        <Link
          className="flex inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-gray-500 px-3 py-1 text-white outline-none hover:bg-gray-800"
          href="/auth/signup"
        >
          Create Account
        </Link>
        <Link
          className="flex inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-gray-500 px-3 py-1 text-white outline-none hover:bg-gray-800"
          href="/auth/signin"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-end gap-2">
      <Link
        className="flex inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-gray-500 px-3 py-1 text-white outline-none hover:bg-gray-800"
        href="/dashboard"
      >
        Account
      </Link>
      <button
        className="flex inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-gray-500 px-3 py-1 text-white outline-none hover:bg-gray-800"
        onClick={signOut}
        type="button"
      >
        Sign out
      </button>
      {/* <div className="text-xs">{user.email}</div> */}
    </div>
  );
}

export { AppHeaderUser };
