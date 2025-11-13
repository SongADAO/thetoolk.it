"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import {
  FaGear,
  FaPenToSquare,
  FaRightFromBracket,
  FaRightToBracket,
} from "react-icons/fa6";

import { AuthContext } from "@/contexts/AuthContext";

function AppHeaderUser() {
  const { user, signOut } = use(AuthContext);

  const router = useRouter();

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    router.push("/auth/signin");
  };

  if (!user) {
    return (
      <div className="flex flex-row items-end gap-2">
        {/* <Link
          className="flex inline-flex cursor-pointer items-center justify-center gap-3 rounded bg-gray-500 px-3 py-1 text-white outline-none hover:bg-gray-800"
          href="/pro"
          title="Create Post"
        >
          Create Post
        </Link> */}
        {/* <Link
          className="flex inline-flex cursor-pointer items-center justify-center gap-3 rounded bg-gray-500 px-3 py-1 text-white outline-none hover:bg-gray-800"
          href="/auth/signup"
          title="Create Account"
        >
          Create Account
        </Link> */}
        <Link
          className="flex inline-flex cursor-pointer items-center justify-center gap-3 rounded bg-gray-500 px-4 py-3 font-bold text-white outline-none hover:bg-gray-800"
          href="/auth/signin"
          title="Sign In"
        >
          <FaRightToBracket className="size-6" />
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-end gap-2">
      <Link
        className="flex inline-flex cursor-pointer items-center justify-center gap-3 rounded bg-gray-500 px-4 py-3 font-bold text-white outline-none hover:bg-gray-800"
        href="/pro"
        title="Create a Post"
      >
        <FaPenToSquare className="size-6" />
        Post
      </Link>
      <Link
        className="flex inline-flex cursor-pointer items-center justify-center gap-3 rounded bg-gray-500 p-3 text-white outline-none hover:bg-gray-800"
        href="/account"
        title="Manage Account"
      >
        <FaGear className="size-6" />
      </Link>
      <button
        className="flex inline-flex cursor-pointer items-center justify-center gap-3 rounded bg-gray-500 p-3 text-white outline-none hover:bg-gray-800"
        onClick={handleSignOut}
        title="Sign out"
        type="button"
      >
        <FaRightFromBracket className="size-6" />
      </button>
    </div>
  );
}

export { AppHeaderUser };
