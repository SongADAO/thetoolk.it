import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  alternates: {
    canonical: "/auth/forgot-password",
  },
  description:
    "Forgot your password?  Start a password reset by entering your email address.",
  title: "Forgot Password - TheToolk.it",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center p-4 md:py-20">
      <section className="w-full">
        <h1 className="mx-auto mb-4 max-w-md text-2xl font-bold">
          Forgot Password
        </h1>
        <ForgotPasswordForm />
      </section>
    </div>
  );
}
