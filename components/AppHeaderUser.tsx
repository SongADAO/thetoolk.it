"use client";

import Link from "next/link";
import { use } from "react";

import { AuthContext } from "@/contexts/AuthContext";

function AppHeaderUser() {
  const { user, signOut } = use(AuthContext);

  if (!user) {
    return <Link href="/auth/signin">Sign in</Link>;
  }

  return (
    <div>
      <div>{user.id}</div>
      <div>{user.email}</div>
      <button onClick={signOut} type="button">
        Sign out
      </button>
    </div>
  );
}

export { AppHeaderUser };
