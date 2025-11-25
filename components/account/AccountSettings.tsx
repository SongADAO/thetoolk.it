"use client";

import { use } from "react";

import { ChangeEmailForm } from "@/components/auth/ChangeEmailForm";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { TOTPSetup } from "@/components/auth/TOTPSetup";
import { Box } from "@/components/general/Box";
import { BoxHeader } from "@/components/general/BoxHeader";
import { BoxMain } from "@/components/general/BoxMain";
import { AuthContext } from "@/contexts/AuthContext";

function AccountSettings() {
  const { user, isLoading, isAuthenticated } = use(AuthContext);

  if (isLoading) {
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
      <h1 className="text-3xl font-bold">Account Settings</h1>
      <TOTPSetup />

      <Box>
        <BoxHeader>
          <h2 className="font-bold">Change Email</h2>
        </BoxHeader>
        <BoxMain>
          <ChangeEmailForm />
        </BoxMain>
      </Box>

      <Box>
        <BoxHeader>
          <h2 className="font-bold">Change Password</h2>
        </BoxHeader>
        <BoxMain>
          <ChangePasswordForm />
        </BoxMain>
      </Box>
    </div>
  );
}

export { AccountSettings };
