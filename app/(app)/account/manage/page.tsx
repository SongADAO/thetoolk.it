import type { Metadata } from "next";

import { AccountSettings } from "@/components/account/AccountSettings";

export const metadata: Metadata = {
  alternates: {
    canonical: "/account/manage",
  },
  description: "Manage your account settings and preferences on TheToolk.it.",
  title: "Manage Account - TheToolk.it",
};

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center p-4 md:py-20">
      <div className="w-full">
        <AccountSettings />
      </div>
    </div>
  );
}
