"use client";

import { use } from "react";

import { Box } from "@/components/general/Box";
import { BoxHeader } from "@/components/general/BoxHeader";
import { BoxMain } from "@/components/general/BoxMain";
import { LinkButton } from "@/components/general/LinkButton";
import { AuthContext } from "@/contexts/AuthContext";

function UserProfile() {
  const { user, isLoading, isAuthenticated } = use(AuthContext);

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div className="p-4 text-center">Not authenticated</div>;
  }

  return (
    <Box>
      <BoxHeader>
        <h1 className="font-bold">Profile</h1>
      </BoxHeader>
      <BoxMain>
        <div className="space-y-4">
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
          <div className="flex items-center gap-4">
            <LinkButton href="/account/manage">Manage Account</LinkButton>
          </div>
        </div>
      </BoxMain>
    </Box>
  );
}

export { UserProfile };
