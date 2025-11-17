import type { Metadata } from "next";

import { AccountSettingsForm } from "@/components/Auth/AccountSettingsForm";

export const metadata: Metadata = {
  alternates: {
    canonical: "/account/manage",
  },
  description: "Manage your account settings and preferences on TheToolk.it.",
  title: "Manage - TheToolk.it",
};
export default function SignInPage() {
  return (
    <div className="flex items-center justify-center p-4 md:pt-20">
      <div className="w-full">
        <AccountSettingsForm />
      </div>
    </div>
  );
}
