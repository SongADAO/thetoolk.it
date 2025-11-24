"use client";

import { use } from "react";

import { UserProfile } from "@/components/account/UserProfile";
import { UserSubscription } from "@/components/account/UserSubscription";
import { AuthContext } from "@/contexts/AuthContext";

function Account() {
  const { user, loading, isAuthenticated } = use(AuthContext);

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="p-4 text-center">
        Please log in to access your account.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold">Account</h1>
      <UserProfile />
      <UserSubscription />
    </div>
  );
}

export { Account };
