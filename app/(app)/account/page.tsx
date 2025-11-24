import type { Metadata } from "next";

import { Account } from "@/components/account/Account";

export const metadata: Metadata = {
  alternates: {
    canonical: "/account",
  },
  description:
    "Manage your account settings, view your subscription details, and update your profile information on TheToolk.it.",
  title: "My Account - TheToolk.it",
};

export default function Dashboard() {
  return (
    <div className="flex items-center justify-center p-4 md:py-20">
      <div className="w-full">
        <Account />
      </div>
    </div>
  );
}
